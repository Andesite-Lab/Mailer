export interface IBasaltAuthorization {
    checkContainOneOfPermissions(permissionsToSearch: string[], entityToCheck: Record<string, string[]>): boolean;
    checkContainAllOfPermissions(permissionsToSearch: string[], entityToCheck: Record<string, string[]>): boolean;
}
