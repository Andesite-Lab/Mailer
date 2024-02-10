import { MailTrackReadModel } from '@/Infrastructure/Repository/Model';

export class TrackReadMail {
    private readonly _mailTrackReadModel: MailTrackReadModel = new MailTrackReadModel();

    public async execute (mailUuid: string): Promise<void> {
        await this._mailTrackReadModel.insert([{
            mailUuid
        }]);
    }
}
