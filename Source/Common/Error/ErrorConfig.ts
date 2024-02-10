import { ErrorEntity } from '@/Common/Error';

export enum ErrorConfigKey {
    DB_HOST_NOT_FOUND = 'DB_HOST_NOT_FOUND',
    DB_NAME_NOT_FOUND = 'DB_NAME_NOT_FOUND',
    DB_PASSWORD_NOT_FOUND = 'DB_PASSWORD_NOT_FOUND',
    DB_USER_NOT_FOUND = 'DB_USER_NOT_FOUND',
    DB_PORT_NOT_FOUND = 'DB_PORT_NOT_FOUND',
    COOKIE_SECRET_NOT_FOUND = 'COOKIE_SECRET_NOT_FOUND',
    HOST_NOT_FOUND = 'HOST_NOT_FOUND',
    HTTP_PORT_NOT_FOUND = 'HTTP_PORT_NOT_FOUND',
    NODE_ENV_NOT_FOUND = 'NODE_ENV_NOT_FOUND',
    RED_PANDA_BROKER_NOT_FOUND = 'RED_PANDA_BROKER_NOT_FOUND',
    WS_PORT_NOT_FOUND = 'WS_PORT_NOT_FOUND',
}

const ErrorConfigKeyCode: { [p: string]: number } = {
    [ErrorConfigKey.DB_HOST_NOT_FOUND]: 500,
    [ErrorConfigKey.DB_NAME_NOT_FOUND]: 500,
    [ErrorConfigKey.DB_PASSWORD_NOT_FOUND]: 500,
    [ErrorConfigKey.DB_USER_NOT_FOUND]: 500,
    [ErrorConfigKey.DB_PORT_NOT_FOUND]: 500,
    [ErrorConfigKey.COOKIE_SECRET_NOT_FOUND]: 500,
    [ErrorConfigKey.HOST_NOT_FOUND]: 500,
    [ErrorConfigKey.HTTP_PORT_NOT_FOUND]: 500,
    [ErrorConfigKey.NODE_ENV_NOT_FOUND]: 500,
    [ErrorConfigKey.RED_PANDA_BROKER_NOT_FOUND]: 500,
    [ErrorConfigKey.WS_PORT_NOT_FOUND]: 500,
};

export class ErrorConfig extends ErrorEntity {
    public constructor(e: {
        key: string,
        detail?: unknown,
        interpolation?: { [key: string]: unknown }
    }) {
        super({
            code: ErrorConfigKeyCode[e.key],
            messageKey: `error.errorConfig.${e.key}`,
            detail: e.detail,
            interpolation: e.interpolation,
        });
    }

}
