import { CronJob } from 'cron';

import { IWorker } from '@/Worker/Interface';
import { SendMail } from '@/Domain/UseCase';
import { ErrorEntity } from '@/Common/Error';
import { I18n, Language } from '@/Config';
import { BasaltLogger } from '@basalt-lab/basalt-logger';

export class MailerCron implements IWorker {
    private _job: CronJob = new CronJob(
        '*/30 * * * * *',
        (): void => {}
    );

    public start(): void {
        const sendMailUseCase: SendMail = new SendMail();
        this._job.addCallback(async (): Promise<void> => {
            try {
                await sendMailUseCase.execute();
            } catch (error) {
                if (error instanceof ErrorEntity)
                    error.message = I18n.translate(error.message, Language.EN);
                BasaltLogger.error(error);
            }
        });
        this._job.start();
    }

    public stop(): void {
        this._job.stop();
    }

}
