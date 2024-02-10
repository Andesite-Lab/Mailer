import { AbstractModel } from '@/Infrastructure/Repository/Model';
import { IMailDTO } from '@/Data/DTO/Models';

export class MailModel extends AbstractModel<IMailDTO> {
    public constructor() {
        super('mail');
    }
}
