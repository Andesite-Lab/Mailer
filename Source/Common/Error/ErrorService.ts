import { ErrorEntity } from '@/Common/Error';

export enum ErrorServiceKey {
    HANDLEBARS_TEMPLATE_NOT_FOUND = 'HANDLEBARS_TEMPLATE_NOT_FOUND',
}

const ErrorServiceKeyCode: { [p: string]: number } = {
    HANDLEBARS_TEMPLATE_NOT_FOUND: 500,
};

export class ErrorService extends ErrorEntity {
    public constructor(e: {
        key: string,
        detail?: unknown,
        interpolation?: { [key: string]: unknown }
    }) {
        super({
            code: ErrorServiceKeyCode[e.key],
            messageKey: `error.errorService.${e.key}`,
            detail: e.detail,
            interpolation: e.interpolation,
        });
    }
}
