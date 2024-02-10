import { readFileSync } from 'fs';
import { join } from 'path';

import { MailTrackReadModel } from '@/Infrastructure/Repository/Model';

export class TrackReadMail {
    private readonly _mailTrackReadModel: MailTrackReadModel = new MailTrackReadModel();

    public async execute (mailUuid: string): Promise<Buffer> {
        await this._mailTrackReadModel.insert([{
            mailUuid
        }]);
        return readFileSync(join(__dirname, '../Assets/pique-sel.png'));
    }
}
