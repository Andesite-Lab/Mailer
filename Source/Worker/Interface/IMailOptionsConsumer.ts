export interface IMailOptionsConsumer {
    to: string;
    cc?: string;
    cci?: string;
    mailType: string;
    language: string;
    scheduledEmailDate: string;
}
