import { BasaltLogger } from '@basalt-lab/basalt-logger';

import { IWorker } from '@/Worker/Interface';
import { MailerConsumer, MailerCron } from '@/Worker/Strategy';
import { I18n, Language } from '@/Config';

export class WorkerManager {
    private readonly _workers: IWorker[] = [];

    public constructor() {
        this._workers = this.initializeWorkers();
    }

    private initializeWorkers(): IWorker[] {
        return [
            new MailerConsumer(),
            new MailerCron()
        ];
    }

    public start(): void {
        this._workers.forEach((worker: IWorker): void => worker.start());
        BasaltLogger.log(I18n.translate('workers.start', Language.EN));

    }

    public stop(): void {
        this._workers.forEach((worker: IWorker): void => worker.stop());
        BasaltLogger.log(I18n.translate('workers.stop', Language.EN));
    }
}
