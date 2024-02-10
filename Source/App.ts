import { Command } from 'commander';
import { argv, exit } from 'process';
import { BasaltLogger, ConsoleLoggerStrategy } from '@basalt-lab/basalt-logger';

import { EnvironmentConfiguration, I18n, Language, packageJsonConfiguration } from '@/Config';
import { HttpServerManager } from '@/HTTP/HttpServerManager';
import { RedPandaProducer } from '@/Infrastructure/RedPanda/Producer';
import { MainDatabase } from '@/Infrastructure/Database/Main/MainDatabase';
import { SMTP } from '@/Infrastructure/SMTP';
import { ErrorEntity } from '@/Common/Error';
import { WorkerManager } from '@/Worker/WorkerManager';

if (EnvironmentConfiguration.env.NODE_ENV === 'development')
    require('source-map-support/register');

class App {
    private readonly _httpServerManager: HttpServerManager = new HttpServerManager();
    private readonly _workerManager: WorkerManager = new WorkerManager();

    public async start(): Promise<void> {
        // Connect to brokers and initialize producer
        await RedPandaProducer.instance.connect();

        // Connect to database
        MainDatabase.instance.connect();

        // Connect to SMTP server
        SMTP.instance.connect();

        // Run workers
        this._workerManager.start();

        // Run HTTP server
        await this._httpServerManager.start();

        BasaltLogger.log({
            message: I18n.translate('app.start', Language.EN, {
                name: packageJsonConfiguration.name
            }),
            prefix: EnvironmentConfiguration.env.PREFIX,
            httpPort: EnvironmentConfiguration.env.HTTP_PORT,
            wsPort: EnvironmentConfiguration.env.WS_PORT,
            dbHost: EnvironmentConfiguration.env.DB_HOST,
            dbPort: EnvironmentConfiguration.env.DB_PORT,
        });
    }

    public async stop(): Promise<void> {
        // Stop workers
        this._workerManager.stop();

        // Disconnect from SMTP server
        SMTP.instance.disconnect();

        // Stop HTTP server
        await this._httpServerManager.stop();

        // Disconnect from database
        MainDatabase.instance.disconnect();

        // Disconnect from brokers RedPanda
        await RedPandaProducer.instance.disconnect();

        BasaltLogger.log(I18n.translate('app.stop', Language.EN, {
            name: packageJsonConfiguration.name
        }));
    }
}

const commander: Command = new Command();

commander.version(packageJsonConfiguration.version, '-v, --version', 'Output the current version');

commander
    .command('migrate')
    .description('Run database migrations')
    .option('-r, --rollback', 'Rollback the last migration')
    .option('-ra, --rollback-all', 'Rollback all migrations')
    .action(async (options: {
        rollback?: boolean;
        rollbackAll?: boolean;
    }): Promise<void> => {
        try {
            BasaltLogger.addStrategy('console', new ConsoleLoggerStrategy());

            // Connect to brokers and initialize producer
            await RedPandaProducer.instance.connect();

            // Connect to database
            MainDatabase.instance.connect();

            if (options.rollback)
                console.log('Rolling back the last migration');
            else if (options.rollbackAll)
                await MainDatabase.instance.rollbackAllMigration();
            else
                await MainDatabase.instance.runMigrations();
        } catch (error) {
            if (error instanceof ErrorEntity)
                error.message = I18n.translate(error.message, Language.EN);

            BasaltLogger.error(error);
        } finally {
            setTimeout((): void => {
                exit(0);
            }, 250);
        }
    });

commander
    .command('seed')
    .description('Run seeders')
    .action(async (): Promise<void> => {
        try {
            BasaltLogger.addStrategy('console', new ConsoleLoggerStrategy());

            // Connect to brokers and initialize producer
            await RedPandaProducer.instance.connect();

            // Connect to database
            MainDatabase.instance.connect();

            await MainDatabase.instance.runSeeders();
        } catch (error) {
            if (error instanceof ErrorEntity)
                error.message = I18n.translate(error.message, Language.EN);
            BasaltLogger.error(error);
        } finally {
            setTimeout((): void => {
                exit(0);
            }, 250);
        }
    });

commander.action(async (): Promise<void> => {
    const app: App = new App();
    try {
        BasaltLogger.addStrategy('console', new ConsoleLoggerStrategy());
        await app.start();
    } catch (error) {
        if (error instanceof ErrorEntity)
            error.message = I18n.translate(error.message, Language.EN);
        BasaltLogger.error(error);
        await app.stop();
    }
});
commander.parse(argv);
