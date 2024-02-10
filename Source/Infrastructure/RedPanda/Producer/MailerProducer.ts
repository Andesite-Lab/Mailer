import { RedPandaProducer } from '@/Infrastructure/RedPanda/Producer';
import { Topics } from '@/Infrastructure/RedPanda';

export enum MailTypes {
    WELCOME = 'welcome',
    RESET_PASSWORD = 'reset-password',
    DELETE_ACCOUNT = 'delete-account',
}

export interface IOptionsMailerProducer {
    to: string;
    cc?: string;
    cci?: string;
    mailType: MailTypes;
    language: string;
    scheduledEmailDate?: string;
}


export class MailerProducer {
    public async execute(
        object: unknown,
        options: IOptionsMailerProducer
    ): Promise<void> {
        options.scheduledEmailDate = options.scheduledEmailDate || Date.now().toString();
        await RedPandaProducer.instance.send({
            topic: Topics.MAILER_MICROSERVICE,
            messages: [
                {
                    value: JSON.stringify({
                        object,
                        options,
                    }),
                },
            ],
        });
    }
}
