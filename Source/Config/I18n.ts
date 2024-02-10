import i18n from 'i18next';

import en from '@/Common/lang/en.json';
import fr from '@/Common/lang/fr.json';

export enum Language {
    EN = 'en',
    FR = 'fr',
}

export class I18n {
    private static _instance: I18n;

    private constructor() {
        i18n.init({
            resources: {
                en: { translation: en },
                fr: { translation: fr },
            },
            fallbackLng: Language.EN,
            interpolation: {
                escapeValue: false,
            },
            joinArrays: '\n',

        });
    }

    public static get instance(): I18n {
        if (!I18n._instance)
            I18n._instance = new I18n();
        return I18n._instance;
    }

    public static translate(key: string, language: Language | string = Language.EN, interpolation: { [key: string]: unknown } = {}): string {
        I18n.instance;
        if (typeof language === 'string' && language == '')
            language = Language.EN;
        return i18n.t(key, { lng: language, ...interpolation });
    }
}
