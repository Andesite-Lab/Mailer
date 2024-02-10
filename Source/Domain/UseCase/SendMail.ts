import { MailModel } from '@/Infrastructure/Repository/Model';
import { IMailDTO } from '@/Data/DTO/Models';
import { SMTP } from '@/Infrastructure/SMTP';
import { I18n } from '@/Config';
import { Handlebars } from '@/Domain/Service';

export class SendMail {
    private readonly _mailModel: MailModel = new MailModel();

    public async execute (): Promise<void> {
        const date: Date = new Date();
        const mails: IMailDTO[] = await this._mailModel.find([{
            scheduledEmailDate: {
                $lte: date.toISOString()
            },
            isSent: {
                $eq: false
            }
        }], {}, {
            toThrow: false
        });

        for (const mailItem of mails) {
            const interpolation: {
                username: string;
                email: string;
            } = mailItem.interpolation as {
                username: string;
                email: string;
            };

            SMTP.instance.sendMail({
                priority: 'high',
                to: mailItem.to,
                cc: mailItem.cc,
                subject: I18n.translate('assets.handlebars.welcome.subject', mailItem.language, {
                    username: interpolation.username,
                }),
                html: Handlebars.instance.render(`${mailItem.mailType}.handlebars`, {
                    lang: mailItem.language,
                    title: I18n.translate('assets.handlebars.welcome.title', mailItem.language, {
                        username: interpolation.username,
                    }),
                    header: I18n.translate('assets.handlebars.welcome.header', mailItem.language, {
                        username: interpolation.username,
                    }),
                    content: I18n.translate('assets.handlebars.welcome.content', mailItem.language, {
                        username: interpolation.username,
                    }),
                    footer: I18n.translate('assets.handlebars.welcome.footer', mailItem.language),
                    url: `https://${process.env.DOMAIN}/api/auth/mail/${mailItem.uuid}`,
                }),
                replyTo: 'nicolas.dsp@proton.me'
            });
        }

        if (mails.length > 0)
            await this._mailModel.update({
                isSent: true
            }, mails.map(mail => ({ uuid: mail.uuid })));
    }
}
