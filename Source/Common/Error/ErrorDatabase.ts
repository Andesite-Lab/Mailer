import { ErrorEntity } from '@/Common/Error';

export enum ErrorDatabaseKey {
    DB_CONNECTION_ERROR = 'DB_CONNECTION_ERROR',
    DB_DISCONNECT_ERROR = 'DB_DISCONNECT_ERROR',
    DB_NOT_CONNECTED = 'DB_NOT_CONNECTED',
    MODEL_NOT_CREATED = 'MODEL_NOT_CREATED',
    MODEL_UNIQUE_CONSTRAINT_ERROR = 'MODEL_UNIQUE_CONSTRAINT_ERROR',
    MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
    MODEL_NOT_UPDATED = 'MODEL_NOT_UPDATED',
    MODEL_NOT_DELETED = 'MODEL_NOT_DELETED',
    OTHER_DATABASE_ERROR = 'OTHER_DATABASE_ERROR',
}

const ErrorDatabaseKeyCode: { [p: string]: number } = {
    DB_CONNECTION_ERROR: 500,
    DB_DISCONNECT_ERROR: 500,
    DB_NOT_CONNECTED: 500,
    MODEL_NOT_CREATED: 500,
    MODEL_UNIQUE_CONSTRAINT_ERROR: 500,
    MODEL_NOT_FOUND: 500,
    MODEL_NOT_UPDATED: 500,
    MODEL_NOT_DELETED: 500,
    OTHER_DATABASE_ERROR: 500,
};

export class ErrorDatabase extends ErrorEntity {
    public constructor(e: {
        key: string,
        detail?: unknown,
        interpolation?: { [key: string]: unknown }
    }) {
        super({
            code: ErrorDatabaseKeyCode[e.key],
            messageKey: `error.errorDatabase.${e.key}`,
            detail: e.detail,
            interpolation: e.interpolation,
        });
    }
}
