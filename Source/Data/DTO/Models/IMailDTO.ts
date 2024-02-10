export interface IMailDTO {
    to: string;
    cc?: string;
    mailType: string;
    language: string;
    interpolation: unknown;
    scheduledEmailDate: Date;
    isSent: boolean;
    uuid: string;
}
