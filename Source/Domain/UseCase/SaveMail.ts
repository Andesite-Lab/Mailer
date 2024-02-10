import { IMailDTO } from '@/Data/DTO/Models';
import { MailModel } from '@/Infrastructure/Repository/Model';

export class SaveMail {
    private readonly _mailModel: MailModel = new MailModel();

    public async execute(mail: Partial<IMailDTO>): Promise<void> {
        await this._mailModel.insert([mail]);
    }
}
