import { ErrorEntity } from '@/Common/Error';

export enum ErrorExternalKey {
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    NOT_FOUND = 'NOT_FOUND',
    TIMEOUT = 'TIMEOUT',
    SERVER_ERROR = 'SERVER_ERROR',
}

const ErrorExternalKeyCode: { [p: string]: number } = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TIMEOUT: 408,
    SERVER_ERROR: 500,
};

export class ErrorExternal extends ErrorEntity {
    public constructor(e: {
        key: string,
        detail?: unknown,
        interpolation?: { [key: string]: unknown }
    }) {
        super({
            code: ErrorExternalKeyCode[e.key],
            messageKey: `error.errorExternal.${e.key}`,
            detail: e.detail,
            interpolation: e.interpolation,
        });
    }
}
