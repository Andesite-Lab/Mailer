import { FastifyReply, FastifyRequest } from 'fastify';
import { BasaltLogger } from '@basalt-lab/basalt-logger';

import { AbstractHandler } from '@/HTTP/Handler/AbstractHandler';
import {
    Count,
    Delete,
    DeleteAll,
    DeleteOne,
    Find,
    FindAll,
    FindOne,
    Insert,
    Truncate,
    Update,
    UpdateAll,
    UpdateOne
} from '@/Domain/UseCase/CRUD';
import { I18n } from '@/Config';
import { IdValidator, PaginationOptionsValidator, UuidValidator, WhereClauseValidator } from '@/Validator';
import { IPaginationOptionsDTO, IWhereClauseDTO } from '@/Data/DTO';
import { Hash } from '@/Common';

export class AbstractHandlerCrud<T extends NonNullable<unknown>, U> extends AbstractHandler {
    private readonly _tableName: string;
    private readonly _keyInclusionFilter: (keyof T)[];
    private readonly _keyInclusionFilterWhereClause: (keyof IWhereClauseDTO)[] = ['$in', '$nin', '$eq', '$neq', '$match', '$lt', '$lte', '$gt', '$gte'];
    private readonly _validator: new (data: T) => U;
    private readonly _insertUseCase: Insert<T>;
    private readonly _findAllUseCase: FindAll<T>;
    private readonly _findOneUseCase: FindOne<T>;
    private readonly _findUseCase: Find<T>;
    private readonly _updateAllUseCase: UpdateAll<T>;
    private readonly _updateOneUseCase: UpdateOne<T>;
    private readonly _updateUseCase: Update<T>;
    private readonly _deleteAllUseCase: DeleteAll<T>;
    private readonly _deleteOneUseCase: DeleteOne<T>;
    private readonly _deleteUseCase: Delete<T>;
    private readonly _truncateUseCase: Truncate<T>;
    private readonly _countUseCase: Count<T>;

    public constructor(config: {
        tableName: string
        keyInclusionFilter: (keyof T)[],
        validator: new (data: T) => U
    }) {
        super();
        this._tableName = config.tableName;
        this._keyInclusionFilter = config.keyInclusionFilter;
        this._validator = config.validator;
        this._findAllUseCase = new FindAll<T>(config.tableName);
        this._findOneUseCase = new FindOne<T>(config.tableName);
        this._findUseCase = new Find<T>(config.tableName);
        this._insertUseCase = new Insert<T>(config.tableName);
        this._updateAllUseCase = new UpdateAll<T>(config.tableName);
        this._updateOneUseCase = new UpdateOne<T>(config.tableName);
        this._updateUseCase = new Update<T>(config.tableName);
        this._deleteAllUseCase = new DeleteAll<T>(config.tableName);
        this._deleteOneUseCase = new DeleteOne<T>(config.tableName);
        this._deleteUseCase = new Delete<T>(config.tableName);
        this._truncateUseCase = new Truncate<T>(config.tableName);
        this._countUseCase = new Count<T>(config.tableName);
    }

    private filterDuplicate: (data: T[]) => T[] = (data: T[]) => {
        return data.filter((value: T, index: number, self: T[]): boolean => {
            const hash: string = Hash.md5(value);
            return index === self.findIndex((v: T): boolean => Hash.md5(v) === hash);
        });
    };

    private checkReqPaginationOptions = (obj: unknown): IPaginationOptionsDTO | undefined => {
        const rawOptions: { options: string } = obj as { options: string };
        if (!rawOptions.options)
            return undefined;
        return this._basaltKeyInclusionFilter
            .filter<IPaginationOptionsDTO>(
                JSON.parse(rawOptions.options) as IPaginationOptionsDTO || {},
                ['limit', 'offset'],
                true
            );
    };

    private filterWhereClause = (obj: unknown): IWhereClauseDTO => {
        return this._basaltKeyInclusionFilter.filter<IWhereClauseDTO>(obj as IWhereClauseDTO || {}, this._keyInclusionFilterWhereClause, true);
    };

    private checkReqEntitiesEq = (obj: unknown): Partial<T>[] => {
        const rawEntity: { entitiesEq: string } = obj as { entitiesEq: string };
        if (!rawEntity.entitiesEq)
            return [];
        const raw: unknown = JSON.parse(rawEntity.entitiesEq);
        const entities: Partial<T>[] = Array.isArray(raw) ? raw : [raw];
        if (entities.length === 0)
            return [];
        return entities.map((entity: Partial<T>): Partial<T> => this._basaltKeyInclusionFilter.filter<Partial<T>>(entity, this._keyInclusionFilter, true));
    };

    private checkReqEntitiesConditional = (obj: unknown): Partial<Record<keyof T, IWhereClauseDTO>>[] => {
        const rawEntity: { entitiesConditional: string } = obj as { entitiesConditional: string };
        if (!rawEntity.entitiesConditional)
            return [];
        const raw: unknown = JSON.parse(rawEntity.entitiesConditional);
        const entities: Partial<Record<keyof T, IWhereClauseDTO>>[] = Array.isArray(raw) ? raw : [raw];
        if (entities.length === 0)
            return [];
        return entities.map((entity: Partial<Record<keyof T, IWhereClauseDTO>>): Partial<Record<keyof T, IWhereClauseDTO>> => {
            const filteredEntity: Partial<Record<keyof T, IWhereClauseDTO>> = {};
            Object.keys(entity).forEach((key: string): void => {
                filteredEntity[key as keyof T] = this.filterWhereClause(entity[key as keyof T]);
            });
            return filteredEntity;
        });
    };

    private validateEntitiesEq = async (entitiesEq: Partial<T>[], language: string = 'en'): Promise<void[]> => {
        return Promise.all(entitiesEq.map((entity: Partial<T>) => {
            const entityValidator: U = new this._validator(entity as T);
            return this.validate(entityValidator as object, language);
        }));
    };

    private validateEntitiesConditional = async (entitiesConditional: Partial<Record<keyof T, IWhereClauseDTO>>[], language: string = 'en'): Promise<Awaited<void>[][]> => {
        return Promise.all(entitiesConditional.map((entity: Partial<Record<keyof T, IWhereClauseDTO>>) => {
            return Promise.all(Object.keys(entity).map((key: string) => {
                const whereClauseValidator: WhereClauseValidator<IWhereClauseDTO> = new WhereClauseValidator<IWhereClauseDTO>(entity[key as keyof T] as IWhereClauseDTO);
                return this.validate(whereClauseValidator, language);
            }));
        }));
    };

    public insert = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
        try {
            const bodies: T[] = Array.isArray(req.body) ? req.body : [req.body];
            const filteredEntities: T[] = bodies.map((entity: T) => this._basaltKeyInclusionFilter.filter<T>(entity, this._keyInclusionFilter, true));
            const validatedEntities: U[] = filteredEntities.map((entity: T) => new this._validator(entity));
            await Promise.all(validatedEntities.map(async (entity: U): Promise<void> => await this.validate(entity as object, reply.request.headers['accept-language'])));
            const data: T[] = await this._insertUseCase.execute(filteredEntities);
            this.sendResponse(
                reply,
                200,
                I18n.translate('http.handler.CRUD.insert', reply.request.headers['accept-language'], {
                    tableName: this._tableName,
                }),
                {
                    data,
                    count: data.length,
                }
            );
        } catch (e) {
            if (e instanceof Error)
                BasaltLogger.error({
                    error: e,
                    trace: e.stack,
                });
            this.sendError(reply, e);
        }
    };

    public findAll = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
        try {
            const paginationOptionsDTO: IPaginationOptionsDTO | undefined = this.checkReqPaginationOptions(req.query);
            const paginationOptionsValidator: PaginationOptionsValidator<IPaginationOptionsDTO> = new PaginationOptionsValidator(paginationOptionsDTO);
            await this.validate(paginationOptionsValidator, req.headers['accept-language']);
            const data: T[] = await this._findAllUseCase.execute(paginationOptionsDTO);
            this.sendResponse(
                reply,
                200,
                I18n.translate('http.handler.CRUD.findAll', reply.request.headers['accept-language'], {
                    tableName: this._tableName,
                }),
                {
                    data,
                    count: data.length,
                }
            );
        } catch (e) {
            if (e instanceof Error)
                BasaltLogger.error({
                    error: e,
                    trace: e.stack,
                });
            this.sendError(reply, e);
        }
    };

    public findOneById = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
        try {
            const filteredId: { id: string } = this._basaltKeyInclusionFilter
                .filter<{ id: string }>(req.params as { id: string }, ['id'], true);
            const idValidator: IdValidator = new IdValidator(filteredId.id);
            await this.validate(idValidator, req.headers['accept-language']);
            const data: T | undefined = await this._findOneUseCase.execute({
                id: parseInt(filteredId.id),
            } as unknown as T);
            this.sendResponse(
                reply,
                200,
                I18n.translate('http.handler.CRUD.findOne', reply.request.headers['accept-language'], {
                    tableName: this._tableName,
                }),
                {
                    data,
                });

        } catch (e) {
            if (e instanceof Error)
                BasaltLogger.error({
                    error: e,
                    trace: e.stack,
                });
            this.sendError(reply, e);
        }
    };

    public findOneByUuid = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
        try {
            const filteredUuid: { uuid: string } = this._basaltKeyInclusionFilter
                .filter<{ uuid: string }>(req.params as { uuid: string }, ['uuid'], true);
            const uuidValidator: UuidValidator = new UuidValidator(filteredUuid.uuid);
            await this.validate(uuidValidator, req.headers['accept-language']);

            const data: T | undefined = await this._findOneUseCase.execute({
                uuid: filteredUuid.uuid,
            } as unknown as T);
            this.sendResponse(
                reply,
                200,
                I18n.translate('http.handler.CRUD.findOne', reply.request.headers['accept-language'], {
                    tableName: this._tableName,
                }),
                {
                    data,
                });

        } catch (e) {
            if (e instanceof Error)
                BasaltLogger.error({
                    error: e,
                    trace: e.stack,
                });
            this.sendError(reply, e);
        }
    };

    public find = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
        try {
            const paginationOptionsDTO: IPaginationOptionsDTO | undefined = this.checkReqPaginationOptions(req.query);
            const paginationOptionsValidator: PaginationOptionsValidator<IPaginationOptionsDTO> = new PaginationOptionsValidator(paginationOptionsDTO);

            const entitiesEq: Partial<T>[] = this.checkReqEntitiesEq(req.query);
            const entitiesConditional: Partial<Record<keyof T, IWhereClauseDTO>>[] = this.checkReqEntitiesConditional(req.query);

            const validatedPaginationOptions: void = await this.validate(paginationOptionsValidator, req.headers['accept-language']);

            await Promise.all(
                [
                    this.validateEntitiesEq(entitiesEq, req.headers['accept-language']),
                    this.validateEntitiesConditional(entitiesConditional, req.headers['accept-language']),
                    validatedPaginationOptions
                ]
            );

            let data: T[] = [];
            if (entitiesEq.length > 0) {
                const dataEq: T[] = await this._findUseCase.execute(entitiesEq, paginationOptionsDTO);
                data = data.concat(dataEq);
            }
            if (entitiesConditional.length > 0) {
                const dataCd: T[] = await this._findUseCase.execute(entitiesConditional, paginationOptionsDTO);
                data = data.concat(dataCd);
            }
            data = this.filterDuplicate(data);

            this.sendResponse(
                reply,
                200,
                I18n.translate('http.handler.CRUD.find', reply.request.headers['accept-language'], {
                    tableName: this._tableName,
                }),
                {
                    data,
                    count: data.length,
                }
            );
        } catch (e) {
            if (e instanceof Error)
                BasaltLogger.error({
                    error: e,
                    trace: e.stack,
                });
            this.sendError(reply, e);
        }
    };

    public updateAll = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
        try {
            const filteredBody: T = this._basaltKeyInclusionFilter.filter<T>(req.body as T, this._keyInclusionFilter, true);
            const validatedBody: U = new this._validator(filteredBody);

            await this.validate(validatedBody as object, reply.request.headers['accept-language'] || 'en');
            await this._updateAllUseCase.execute(filteredBody);
            this.sendResponse(
                reply,
                200,
                I18n.translate('http.handler.CRUD.updateAll', reply.request.headers['accept-language'], {
                    tableName: this._tableName,
                })
            );
        } catch (e) {
            if (e instanceof Error)
                BasaltLogger.error({
                    error: e,
                    trace: e.stack,
                });
            this.sendError(reply, e);
        }
    };

    public updateOneById = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
        try {
            const filteredId: { id: string } = this._basaltKeyInclusionFilter
                .filter<{ id: string }>(req.params as { id: string }, ['id'], true);
            const idValidator: IdValidator = new IdValidator(filteredId.id);

            const filteredBody: T = this._basaltKeyInclusionFilter.filter<T>(req.body as T, this._keyInclusionFilter, true);
            const validatedBody: U = new this._validator(filteredBody);

            await Promise.all([
                this.validate(idValidator, req.headers['accept-language']),
                this.validate(validatedBody as object, reply.request.headers['accept-language'] || 'en')
            ]);
            await this._updateOneUseCase.execute(filteredBody, {
                id: parseInt(filteredId.id),
            } as unknown as T);
            this.sendResponse(
                reply,
                200,
                I18n.translate('http.handler.CRUD.updateOne', reply.request.headers['accept-language'], {
                    tableName: this._tableName,
                })
            );
        } catch (e) {
            if (e instanceof Error)
                BasaltLogger.error({
                    error: e,
                    trace: e.stack,
                });
            this.sendError(reply, e);
        }
    };

    public updateOneByUuid = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
        try {
            const filteredUuid: { uuid: string } = this._basaltKeyInclusionFilter
                .filter<{ uuid: string }>(req.params as { uuid: string }, ['uuid'], true);
            const uuidValidator: UuidValidator = new UuidValidator(filteredUuid.uuid);

            const filteredBody: T = this._basaltKeyInclusionFilter.filter<T>(req.body as T, this._keyInclusionFilter, true);
            const validatedBody: U = new this._validator(filteredBody);

            await Promise.all([
                this.validate(uuidValidator, req.headers['accept-language']),
                this.validate(validatedBody as object, reply.request.headers['accept-language'] || 'en')
            ]);
            await this._updateOneUseCase.execute(filteredBody, {
                uuid: filteredUuid.uuid,
            } as unknown as T);
            this.sendResponse(
                reply,
                200,
                I18n.translate('http.handler.CRUD.updateOne', reply.request.headers['accept-language'], {
                    tableName: this._tableName,
                })
            );
        } catch (e) {
            if (e instanceof Error)
                BasaltLogger.error({
                    error: e,
                    trace: e.stack,
                });
            this.sendError(reply, e);
        }
    };

    public update = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
        try {
            const entitiesEq: Partial<T>[] = this.checkReqEntitiesEq(req.query);
            const entitiesConditional: Partial<Record<keyof T, IWhereClauseDTO>>[] = this.checkReqEntitiesConditional(req.query);

            const filteredEntity: T = this._basaltKeyInclusionFilter.filter<T>(req.body as T, this._keyInclusionFilter, true);
            const validatedEntity: U = new this._validator(filteredEntity);

            await Promise.all(
                [
                    this.validateEntitiesEq(entitiesEq, req.headers['accept-language']),
                    this.validateEntitiesConditional(entitiesConditional, req.headers['accept-language']),
                    this.validate(validatedEntity as object, reply.request.headers['accept-language'] || 'en')
                ]
            );

            let data: T[] = [];
            if (entitiesEq.length > 0) {
                const dataEq: T[] = await this._updateUseCase.execute(filteredEntity, entitiesEq);
                data = data.concat(dataEq);
            }
            if (entitiesConditional.length > 0) {
                const dataCd: T[] = await this._updateUseCase.execute(filteredEntity, entitiesConditional);
                data = data.concat(dataCd);
            }
            data = this.filterDuplicate(data);

            this.sendResponse(
                reply,
                200,
                I18n.translate('http.handler.CRUD.update', reply.request.headers['accept-language'], {
                    tableName: this._tableName,
                }),
                {
                    data,
                    count: data.length,
                }
            );
        } catch (e) {
            if (e instanceof Error)
                BasaltLogger.error({
                    error: e,
                    trace: e.stack,
                });
            this.sendError(reply, e);
        }
    };

    public deleteAll = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
        try {
            await this._deleteAllUseCase.execute();
            this.sendResponse(
                reply,
                200,
                I18n.translate('http.handler.CRUD.deleteAll', reply.request.headers['accept-language'], {
                    tableName: this._tableName,
                })
            );
        } catch (e) {
            this.sendError(reply, e);
        }
    };

    public deleteOneById = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
        try {
            const filteredId: { id: string } = this._basaltKeyInclusionFilter
                .filter<{ id: string }>(req.params as { id: string }, ['id'], true);
            const idValidator: IdValidator = new IdValidator(filteredId.id);
            await this.validate(idValidator, req.headers['accept-language']);
            await this._deleteOneUseCase.execute({
                id: parseInt(filteredId.id),
            } as unknown as T);
            this.sendResponse(
                reply,
                200,
                I18n.translate('http.handler.CRUD.deleteOne', reply.request.headers['accept-language'], {
                    tableName: this._tableName,
                })
            );
        } catch (e) {
            this.sendError(reply, e);
        }
    };

    public deleteOneByUuid = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
        try {
            const filteredUuid: { uuid: string } = this._basaltKeyInclusionFilter
                .filter<{ uuid: string }>(req.params as { uuid: string }, ['uuid'], true);
            const uuidValidator: UuidValidator = new UuidValidator(filteredUuid.uuid);
            await this.validate(uuidValidator, req.headers['accept-language']);
            await this._deleteOneUseCase.execute({
                uuid: filteredUuid.uuid,
            } as unknown as T);
            this.sendResponse(
                reply,
                200,
                I18n.translate('http.handler.CRUD.deleteOne', reply.request.headers['accept-language'], {
                    tableName: this._tableName,
                })
            );
        } catch (e) {
            this.sendError(reply, e);
        }
    };

    public delete = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
        try {
            const entitiesEq: Partial<T>[] = this.checkReqEntitiesEq(req.query);
            const entitiesConditional: Partial<Record<keyof T, IWhereClauseDTO>>[] = this.checkReqEntitiesConditional(req.query);

            await Promise.all(
                [
                    this.validateEntitiesEq(entitiesEq, req.headers['accept-language']),
                    this.validateEntitiesConditional(entitiesConditional, req.headers['accept-language'])
                ]
            );

            let data: T[] = [];
            if (entitiesEq.length > 0) {
                const dataEq: T[] = await this._deleteUseCase.execute(entitiesEq);
                data = data.concat(dataEq);
            }
            if (entitiesConditional.length > 0) {
                const dataCd: T[] = await this._deleteUseCase.execute(entitiesConditional);
                data = data.concat(dataCd);
            }
            data = this.filterDuplicate(data);

            this.sendResponse(
                reply,
                200,
                I18n.translate('http.handler.CRUD.delete', reply.request.headers['accept-language'], {
                    tableName: this._tableName,
                }),
                {
                    data,
                    count: data.length,
                }
            );
        } catch (e) {
            this.sendError(reply, e);
        }
    };

    public truncate = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
        try {
            await this._truncateUseCase.execute();
            this.sendResponse(
                reply,
                200,
                I18n.translate('http.handler.CRUD.truncate', reply.request.headers['accept-language'], {
                    tableName: this._tableName,
                })
            );
        } catch (e) {
            this.sendError(reply, e);
        }
    };

    public count = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
        try {
            const paginationOptionsDTO: IPaginationOptionsDTO | undefined = this.checkReqPaginationOptions(req.query);
            const paginationOptionsValidator: PaginationOptionsValidator<IPaginationOptionsDTO> = new PaginationOptionsValidator(paginationOptionsDTO);


            const entitiesEq: Partial<T>[] = this.checkReqEntitiesEq(req.query);
            const entitiesConditional: Partial<Record<keyof T, IWhereClauseDTO>>[] = this.checkReqEntitiesConditional(req.query);

            await Promise.all(
                [
                    this.validateEntitiesEq(entitiesEq, req.headers['accept-language']),
                    this.validateEntitiesConditional(entitiesConditional, req.headers['accept-language']),
                    this.validate(paginationOptionsValidator, req.headers['accept-language'])
                ]
            );

            let data: number = 0;
            if (entitiesEq.length > 0) {
                const dataEq: number = await this._countUseCase.execute(entitiesEq, paginationOptionsDTO);
                data += dataEq;
            }
            if (entitiesConditional.length > 0) {
                const dataCd: number = await this._countUseCase.execute(entitiesConditional, paginationOptionsDTO);
                data += dataCd;
            }
            else {
                const dataCd: number = await this._countUseCase.execute(undefined, paginationOptionsDTO);
                data += dataCd;
            }

            this.sendResponse(
                reply,
                200,
                I18n.translate('http.handler.CRUD.count', reply.request.headers['accept-language'], {
                    tableName: this._tableName,
                }),
                {
                    data,
                }
            );
        } catch (e) {
            this.sendError(reply, e);
        }
    };
}
