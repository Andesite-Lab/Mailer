import { Knex } from 'knex';

import { IBasaltAuthorization } from '@/Common/Interface';

export class BasaltAuthorization implements IBasaltAuthorization {
    private readonly _database: Knex | undefined;
    private static _instance: BasaltAuthorization;

    public static get instance(): BasaltAuthorization {
        if (!BasaltAuthorization._instance)
            BasaltAuthorization._instance = new BasaltAuthorization();
        return BasaltAuthorization._instance;
    }

    public checkContainOneOfPermissions(permissionsToSearch: string[], entityToCheck: Record<string, string[]>): boolean {
        return permissionsToSearch.some((permission: string) => {
            return Object.values(entityToCheck).some((permissions: string[]) => {
                return permissions.includes(permission);
            });
        });
    }

    public checkContainAllOfPermissions(permissionsToSearch: string[], entityToCheck: Record<string, string[]>): boolean {
        return permissionsToSearch.every((permission: string) => {
            return Object.values(entityToCheck).some((permissions: string[]) => {
                return permissions.includes(permission);
            });
        });
    }
}
