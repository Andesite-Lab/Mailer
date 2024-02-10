import { Knex } from 'knex';

import { ErrorDatabase, ErrorDatabaseKey } from '@/Common/Error';
import { IErrorDatabase, Transaction } from '@/Infrastructure/Database';
import { MainDatabase } from '@/Infrastructure/Database/Main/MainDatabase';
import { IWhereClauseDTO } from '@/Data/DTO';

export abstract class AbstractModel<T extends NonNullable<unknown>> {
    protected readonly _tableName: string;
    protected _knex: Knex;

    public constructor(tableName: string) {
        this._tableName = tableName;
        this._knex = MainDatabase.instance.database as Knex;
    }

    protected transformColumnsToArray<K extends string>(
        columns: Partial<Record<K, string | boolean>>
    ): string[] {
        const entries = Object.entries(columns);
        if (entries.length === 0)
            return ['*'];
        return entries
            .filter(([, value]) =>
                (typeof value === 'boolean' && value) ||
                (typeof value === 'string' && value.length > 0)
            )
            .map(([key, value]): string => typeof value === 'string' ? value : key);
    }

    protected forwardException(err: unknown): void {
        if (err instanceof ErrorDatabase)
            throw err;
        switch ((err as IErrorDatabase)['code']) { // https://docs.postgresql.fr/9.6/errcodes-appendix.html
        case '23505':
            throw new ErrorDatabase({
                key: ErrorDatabaseKey.MODEL_UNIQUE_CONSTRAINT_ERROR,
                interpolation: {
                    tableName: this._tableName,
                    constraint: (err as IErrorDatabase).constraint,
                },
                detail: err,
            });
        default:
            throw new ErrorDatabase({
                key: ErrorDatabaseKey.OTHER_DATABASE_ERROR,
                detail: err
            });
        }
    }

    private isComplexQuery(entity: Partial<T> | Partial<Record<keyof T, Partial<IWhereClauseDTO>>>): boolean {
        const validKeys: Set<string> = new Set(['$in', '$nin', '$eq', '$neq', '$match', '$lt', '$lte', '$gt', '$gte']);
        return Object.values(entity)
            .some(value =>
                value
                && typeof value === 'object'
                && value.constructor === Object
                && Object.keys(value).length > 0
                && Object.keys(value).every(key => validKeys.has(key))
            );
    }

    private applyComplexQuery(query: Knex.QueryBuilder, complexQuery: Partial<Record<keyof T, IWhereClauseDTO>>): Knex.QueryBuilder {
        Object.entries(complexQuery).forEach(([key, value], index): void => {
            const whereClause: IWhereClauseDTO = (value as IWhereClauseDTO);
            if ('$in' in whereClause)
                query = query.orWhereIn(key, whereClause.$in);

            if ('$nin' in whereClause)
                query = query.orWhereNotIn(key, whereClause.$nin);

            if ('$eq' in whereClause)
                query = index === 0 ? query.orWhere(key, whereClause.$eq) : query.andWhere(key, whereClause.$eq);

            if ('$neq' in whereClause)
                query = index === 0 ? query.orWhereNot(key, whereClause.$neq) : query.andWhereNot(key, whereClause.$neq);

            if ('$match' in whereClause)
                query = index === 0 ? query.orWhereLike(key, whereClause.$match) : query.andWhereLike(key, whereClause.$match);

            if ('$lt' in whereClause)
                query = index === 0 ? query.orWhere(key, '<', whereClause.$lt) : query.andWhere(key, '<', whereClause.$lt);

            if ('$lte' in whereClause)
                query = index === 0 ? query.orWhere(key, '<=', whereClause.$lte) : query.andWhere(key, '<=', whereClause.$lte);

            if ('$gt' in whereClause)
                query = index === 0 ? query.orWhere(key, '>', whereClause.$gt) : query.andWhere(key, '>', whereClause.$gt);

            if ('$gte' in whereClause)
                query = index === 0 ? query.orWhere(key, '>=', whereClause.$gte) : query.andWhere(key, '>=', whereClause.$gte);
        });
        return query;
    }

    protected queryBuilder(
        query: Knex.QueryBuilder,
        entitiesToSearch: Partial<T>[] | Partial<Record<keyof T, Partial<IWhereClauseDTO>>>[]
    ): Knex.QueryBuilder {
        entitiesToSearch.forEach((entity: Partial<T> | Partial<Record<keyof T, Partial<IWhereClauseDTO>>>, index: number): void => {
            if (this.isComplexQuery(entity))
                query = this.applyComplexQuery(query, entity as Partial<Record<keyof T, IWhereClauseDTO>>);
            else
                query = index === 0 ? query.where(entity as Partial<T>) : query.orWhere(entity as Partial<T>);
        });
        return query;
    }

    public async insert(
        entity: Partial<T>[],
        columnToSelect: Partial<Record<keyof T, boolean | string>> = {},
        options?: {
            toThrow?: boolean;
            transaction?: Transaction;
        }
    ): Promise<T[]> {
        try {
            let query = this._knex
                .insert(entity)
                .into(this._tableName)
                .returning(this.transformColumnsToArray(columnToSelect));
            if (options?.transaction)
                query = query.transacting(options.transaction);
            const result: T[] = await query;
            if (result.length === 0)
                throw new ErrorDatabase({
                    key: ErrorDatabaseKey.MODEL_NOT_CREATED,
                    interpolation: { tableName: this._tableName },
                });
            return result;
        } catch (err) {
            if (options?.toThrow ?? true)
                this.forwardException(err);
            return [];
        }
    }

    public async update(
        entity: Partial<T>,
        entityToUpdate: Partial<T>[] | Partial<Record<keyof T, Partial<IWhereClauseDTO>>>[],
        columnToSelect: Partial<Record<keyof T, boolean | string>> = {},
        options?: {
            toThrow?: boolean;
            transaction?: Transaction;
        }
    ): Promise<T[]> {
        try {
            let query = this._knex
                .update(entity)
                .from(this._tableName)
                .returning(this.transformColumnsToArray(columnToSelect));

            query = this.queryBuilder(query, entityToUpdate);

            if (options?.transaction)
                query = query.transacting(options.transaction);

            const result: T[] = await query;
            if (result.length === 0)
                throw new ErrorDatabase({
                    key: ErrorDatabaseKey.MODEL_NOT_UPDATED,
                    interpolation: { tableName: this._tableName },
                });
            return result;
        } catch (err) {
            if (options?.toThrow ?? true)
                this.forwardException(err);
            return [];
        }
    }

    public async updateAll(
        entity: Partial<T>,
        columnToSelect: Partial<Record<keyof T, boolean | string>> = {},
        options?: {
            toThrow?: boolean;
            transaction?: Transaction;
        }
    ): Promise<T[]> {
        try {
            let query = this._knex
                .update(entity)
                .from(this._tableName)
                .returning(this.transformColumnsToArray(columnToSelect));
            if (options?.transaction)
                query = query.transacting(options.transaction);

            const result: T[] = await query;
            if (result.length === 0)
                throw new ErrorDatabase({
                    key: ErrorDatabaseKey.MODEL_NOT_UPDATED,
                    interpolation: { tableName: this._tableName },
                });
            return result;
        } catch (err) {
            if (options?.toThrow ?? true)
                this.forwardException(err);
            return [];
        }
    }

    public async delete(
        entitiesToDelete: Partial<T>[] | Partial<Record<keyof T, Partial<IWhereClauseDTO>>>[],
        columnToSelect: Partial<Record<keyof T, boolean | string>> = {},
        options?: {
            toThrow?: boolean;
            transaction?: Transaction;
        }
    ): Promise<T[]> {
        try {
            let query = this._knex
                .del()
                .from(this._tableName)
                .returning(this.transformColumnsToArray(columnToSelect));
            query = this.queryBuilder(query, entitiesToDelete);

            if (options?.transaction)
                query = query.transacting(options.transaction);

            const result: T[] = await query;
            if (result.length === 0)
                throw new ErrorDatabase({
                    key: ErrorDatabaseKey.MODEL_NOT_DELETED,
                    interpolation: { tableName: this._tableName },
                });
            return result;
        } catch (err) {
            if (options?.toThrow ?? true)
                this.forwardException(err);
            return [];
        }
    }

    public async deleteAll(
        columnToSelect: Partial<Record<keyof T, boolean | string>> = {},
        options?: {
            toThrow?: boolean;
            transaction?: Transaction;
        }
    ): Promise<T[]> {
        try {
            let query = this._knex
                .del()
                .from(this._tableName)
                .returning(this.transformColumnsToArray(columnToSelect));
            if (options?.transaction)
                query = query.transacting(options.transaction);

            const result: T[] = await query;
            if (result.length === 0)
                throw new ErrorDatabase({
                    key: ErrorDatabaseKey.MODEL_NOT_DELETED,
                    interpolation: { tableName: this._tableName },
                });
            return result;
        } catch (err) {
            if (options?.toThrow ?? true)
                this.forwardException(err);
            return [];
        }
    }

    public async truncate(options?: {
        toThrow?: boolean;
        transaction?: Transaction;
    }): Promise<void> {
        try {
            let query =  this._knex
                .truncate()
                .from(this._tableName);
            if (options?.transaction)
                query = query.transacting(options.transaction);
            await query;
        } catch (err) {
            if (options?.toThrow ?? true)
                this.forwardException(err);
        }
    }

    public async find(
        entitiesToSearch: Partial<T>[] | Partial<Record<keyof T, Partial<IWhereClauseDTO>>>[],
        columnToSelect: Partial<Record<keyof T, boolean | string>> = {},
        options?: {
            limit?: number;
            offset?: number;
            toThrow?: boolean;
            transaction?: Transaction;
        }
    ): Promise<T[]> {
        try {
            let query: Knex.QueryBuilder = this._knex
                .select(this.transformColumnsToArray(columnToSelect))
                .from(this._tableName);
            query = this.queryBuilder(query, entitiesToSearch);
            if (options?.limit)
                query = query.limit(options.limit);
            if (options?.offset)
                query = query.offset(options.offset);
            if (options?.transaction)
                query = query.transacting(options.transaction);
            const result = await query;
            if (result.length === 0)
                throw new ErrorDatabase({
                    key: ErrorDatabaseKey.MODEL_NOT_FOUND,
                    interpolation: { tableName: this._tableName },
                });
            return result;
        } catch (err) {
            if (options?.toThrow ?? true)
                this.forwardException(err);
            return [];
        }
    }

    public async findOne(
        entitiesToSearch: Partial<T>[] | Partial<Record<keyof T, Partial<IWhereClauseDTO>>>[],
        columnToSelect: Partial<Record<keyof T, boolean | string>> = {},
        options?: {
            toThrow?: boolean;
            transaction?: Transaction;
        }
    ): Promise<T | undefined> {
        try {
            let query = this._knex
                .first(this.transformColumnsToArray(columnToSelect))
                .from<T>(this._tableName);
            query = this.queryBuilder(query, entitiesToSearch);
            if (options?.transaction)
                query = query.transacting(options.transaction);
            const result = await query;
            if (!result)
                throw new ErrorDatabase({
                    key: ErrorDatabaseKey.MODEL_NOT_FOUND,
                    interpolation: { tableName: this._tableName },
                });
            return result;
        } catch (err) {
            if (options?.toThrow ?? true)
                this.forwardException(err);
            return undefined;
        }
    }

    public async findAll(
        columnToSelect: Partial<Record<keyof T, boolean | string>> = {},
        options?: {
            limit?: number;
            offset?: number;
            toThrow?: boolean;
            transaction?: Transaction;
        }
    ): Promise<T[]> {
        try {
            let query = this._knex
                .select(this.transformColumnsToArray(columnToSelect))
                .from(this._tableName);

            if (options?.limit)
                query = query.limit(options.limit);
            if (options?.offset)
                query = query.offset(options.offset);
            if (options?.transaction)
                query = query.transacting(options.transaction);
            const result = await query;
            if (result.length === 0)
                throw new ErrorDatabase({
                    key: ErrorDatabaseKey.MODEL_NOT_FOUND,
                    interpolation: { tableName: this._tableName },
                });
            return result;
        } catch (err) {
            if (options?.toThrow ?? true)
                this.forwardException(err);
            return [];
        }
    }

    public async count(
        entitiesToSearch?: Partial<T>[] | Partial<Record<keyof T, Partial<IWhereClauseDTO>>>[],
        options?: {
            limit?: number;
            offset?: number;
            toThrow?: boolean;
            transaction?: Transaction;
        }
    ): Promise<number> {
        try {
            let query = this._knex
                .count<Record<string, number>>({ count: '*' })
                .from(this._tableName);

            if (entitiesToSearch)
                query = this.queryBuilder(query, entitiesToSearch);
            if (options?.limit)
                query = query.limit(options.limit);
            if (options?.offset)
                query = query.offset(options.offset);
            if (options?.transaction)
                query = query.transacting(options.transaction);
            const result: Record<string, number>[] = await query as unknown as Record<string, number>[];
            return parseInt(result[0].count.toString());
        } catch (err) {
            if (options?.toThrow ?? true)
                this.forwardException(err);
            return 0;
        }
    }
}
