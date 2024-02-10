import nodemailer from 'nodemailer';
import { BasaltLogger } from '@basalt-lab/basalt-logger';

import { EnvironmentConfiguration, I18n, Language } from '@/Config';

export class SMTP {
    private static _instance: SMTP;
    private _transporter: nodemailer.Transporter | undefined;

    public static get instance (): SMTP {
        if (!SMTP._instance)
            SMTP._instance = new SMTP();
        return SMTP._instance;
    }

    public connect (): void {
        this._transporter = nodemailer.createTransport({
            pool: true,
            maxConnections: 20,
            service: 'gmail',
            auth: {
                user: EnvironmentConfiguration.env.SMTP_USER,
                pass: EnvironmentConfiguration.env.SMTP_PASSWORD
            }
        });
        BasaltLogger.log(I18n.translate('infrastructure.smtp.connected', Language.EN));
    }

    public disconnect (): void {
        this._transporter?.close();
        BasaltLogger.log(I18n.translate('infrastructure.smtp.disconnected', Language.EN));
    }

    public sendMail(options: nodemailer.SendMailOptions) {
        return this._transporter?.sendMail({
            ...options,
            from: EnvironmentConfiguration.env.SMTP_USER
        });
    }
}
