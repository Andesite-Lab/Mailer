export interface ITokenPayloadDTO {
    uuid: string;
    username: string;
    rolePermission: Record<string, string[]>;
}
