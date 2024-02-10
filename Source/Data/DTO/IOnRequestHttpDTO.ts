export interface IOnRequestHttpDTO {
    ip: string;
    method: string;
    url: string;
    statusCode: number;
    createdAt: Date;
}
