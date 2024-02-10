import { EnvironmentConfiguration } from '@/Config';
import { AbstractDatabase } from '@/Infrastructure/Database';

export class MainDatabase extends AbstractDatabase {
    private static _instance: MainDatabase;

    private constructor() {
        super({
            client: 'pg',
            connection: {
                host: EnvironmentConfiguration.env.DB_HOST,
                user: EnvironmentConfiguration.env.DB_USER,
                password: EnvironmentConfiguration.env.DB_PASSWORD,
                database: EnvironmentConfiguration.env.DB_NAME,
                port: EnvironmentConfiguration.env.DB_PORT,
            },
            pool: {
                min: 0,
                max: 10,
            },
            acquireConnectionTimeout: 10000,
        });
    }

    public static get instance(): MainDatabase {
        if (!MainDatabase._instance)
            MainDatabase._instance = new MainDatabase();
        return MainDatabase._instance;
    }
}
