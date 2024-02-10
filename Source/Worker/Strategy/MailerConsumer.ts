import { KafkaMessage } from 'kafkajs';

import { IMailConsumer, IWorker } from '@/Worker/Interface';
import { RedPandaConsumer } from '@/Infrastructure/RedPanda/Consommer';
import { Topics } from '@/Infrastructure/RedPanda';
import { IMailDTO } from '@/Data/DTO/Models';
import { SaveMail } from '@/Domain/UseCase';

export class MailerConsumer implements IWorker {
    private readonly _redPandaConsumer: RedPandaConsumer = RedPandaConsumer.instance;

    public async start(): Promise<void> {
        await this._redPandaConsumer.connect();
        await this._redPandaConsumer.subscribe([Topics.MAILER_MICROSERVICE]);

        const saveMailUseCase: SaveMail = new SaveMail();

        await this._redPandaConsumer.eachMessage(async (message: KafkaMessage): Promise<void> => {
            const raw: string = message.value!.toString();
            const mailMessage: IMailConsumer = JSON.parse(raw);
            const scheduledEmailDate: Date = mailMessage.options.scheduledEmailDate ? new Date(mailMessage.options.scheduledEmailDate) : new Date();
            const mail: Omit<IMailDTO, 'uuid' | 'isSent'> = {
                to: mailMessage.options.to,
                cc: mailMessage.options.cc,
                mailType: mailMessage.options.mailType,
                language: mailMessage.options.language,
                scheduledEmailDate,
                interpolation: mailMessage.object,
            };
            await saveMailUseCase.execute(mail);
        });
    }

    public async stop(): Promise<void> {
        await this._redPandaConsumer.disconnect();
    }
}
