import { Knex } from 'knex';

import { CreateMailTable, CreateMailTrackReadTable } from '@/Infrastructure/Database/Main/Migration';

export class MigrationSource implements Knex.MigrationSource<unknown> {
    private migrations: Map<string, Knex.Migration> = new Map<string, Knex.Migration>(
        [
            ['CreateMailTable', CreateMailTable],
            ['CreateMailTrackReadTable', CreateMailTrackReadTable]
        ]
    );

    public getMigrations(): Promise<string[]> {
        return Promise.resolve(Array.from(this.migrations.keys()));
    }

    public getMigrationName(migration: string): string {
        return migration;
    }

    public getMigration(migration: string): Promise<Knex.Migration> {
        return new Promise((resolve, reject): void => {
            const migrationFunctions: Knex.Migration | undefined = this.migrations.get(migration);

            if (migrationFunctions)
                resolve({
                    up: migrationFunctions.up,
                    down: migrationFunctions.down
                });
            else
                reject(new Error(`Migration not found: ${migration}`));

        });
    }
}
