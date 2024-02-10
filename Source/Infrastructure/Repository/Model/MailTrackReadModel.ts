import { AbstractModel } from '@/Infrastructure/Repository/Model';
import { IMailTrackReadDTO } from '@/Data/DTO/Models';

export class MailTrackReadModel extends AbstractModel<IMailTrackReadDTO> {
    public constructor() {
        super('mail_track_read');
    }
}
