import { Knex, knex } from 'knex';
import { BasaltLogger } from '@basalt-lab/basalt-logger';

import { ErrorDatabase, ErrorDatabaseKey } from '@/Common/Error';
import { MigrationSource } from '@/Infrastructure/Database/Main/Migration';
import { SeedSource } from '@/Infrastructure/Database/Main/Seed';
import { I18n, Language } from '@/Config';
import Transaction = Knex.Transaction;

export type { Transaction };

export interface IErrorDatabase {
    length: number;
    name: string;
    severity: string;
    code: string;
    detail: string;
    hint: string;
    position: string;
    internalPosition: string;
    internalQuery: string;
    where: string;
    schema: string;
    table: string;
    column: string;
    dataType: string;
    constraint: string;
    file: string;
    line: string;
    routine: string;
    stack: string;
    message: string;
}

export class AbstractDatabase {
    protected readonly _config: Knex.Config;
    private _database: Knex | undefined;

    protected constructor(config: Knex.Config) {
        this._config = config;
    }

    public get database(): Knex | undefined {
        return this._database;
    }

    public connect(): AbstractDatabase {
        try {
            this._database = knex({
                ...this._config,
            });
            this._database.raw('select 1+1 as result')
                .catch(err => {
                    throw new ErrorDatabase({
                        key: ErrorDatabaseKey.DB_CONNECTION_ERROR,
                        detail: err
                    });
                });
            BasaltLogger.log(I18n.translate('infrastructure.database.connected', Language.EN));
            return this;
        } catch (error) {
            throw new ErrorDatabase({
                key: ErrorDatabaseKey.DB_CONNECTION_ERROR,
                detail: error
            });
        }
    }

    public disconnect(): void {
        try {
            this._database?.destroy();
            BasaltLogger.log(I18n.translate('infrastructure.database.disconnected', Language.EN));
        } catch (error) {
            throw new ErrorDatabase({
                key: ErrorDatabaseKey.DB_DISCONNECT_ERROR,
                detail: error
            });
        }
    }

    public async runMigrations(): Promise<void> {
        if (!this._database)
            throw new ErrorDatabase({
                key: ErrorDatabaseKey.DB_NOT_CONNECTED
            });
        const result = await this._database.migrate.latest({
            migrationSource: new MigrationSource()
        });
        BasaltLogger.log({
            message: I18n.translate('infrastructure.database.migrations_run', Language.EN),
            result
        });
    }

    public async rollbackAllMigration(): Promise<void> {
        if (!this._database)
            throw new ErrorDatabase({
                key: ErrorDatabaseKey.DB_NOT_CONNECTED
            });
        const result = await this._database.migrate.rollback({
            migrationSource: new MigrationSource(),
        }, true);
        BasaltLogger.log({
            message: I18n.translate('infrastructure.database.migrations_rollback_all', Language.EN),
            result
        });
    }

    public async runSeeders(): Promise<void> {
        if (!this._database)
            throw new ErrorDatabase({
                key: ErrorDatabaseKey.DB_NOT_CONNECTED
            });
        const result = await this._database.seed.run({
            seedSource: new SeedSource(),
        });
        BasaltLogger.log({
            message: I18n.translate('infrastructure.database.seeders_run', Language.EN),
            result
        });
    }
}
