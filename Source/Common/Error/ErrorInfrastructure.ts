import { ErrorEntity } from '@/Common/Error';


export enum ErrorInfrastructureKey {
    KAFKA_PRODUCER_CONNECTION_ERROR = 'KAFKA_PRODUCER_CONNECTION_ERROR',
    KAFKA_PRODUCER_IS_NOT_CONNECTED = 'KAFKA_PRODUCER_IS_NOT_CONNECTED',
    KAFKA_PRODUCER_DISCONNECT_ERROR = 'KAFKA_PRODUCER_DISCONNECT_ERROR',
    KAFKA_PRODUCER_SEND_ERROR = 'KAFKA_PRODUCER_SEND_ERROR',
    KAFKA_CONSUMER_CONNECTION_ERROR = 'KAFKA_CONSUMER_CONNECTION_ERROR',
    KAFKA_CONSUMER_IS_NOT_CONNECTED = 'KAFKA_CONSUMER_IS_NOT_CONNECTED',
    KAFKA_CONSUMER_SUBSCRIBE_ERROR = 'KAFKA_CONSUMER_SUBSCRIBE_ERROR',
    KAFKA_CONSUMER_DISCONNECT_ERROR = 'KAFKA_CONSUMER_DISCONNECT_ERROR',
}

const ErrorInfrastructureKeyCode: { [p: string]: number } = {
    [ErrorInfrastructureKey.KAFKA_PRODUCER_CONNECTION_ERROR]: 500,
    [ErrorInfrastructureKey.KAFKA_PRODUCER_IS_NOT_CONNECTED]: 500,
    [ErrorInfrastructureKey.KAFKA_PRODUCER_DISCONNECT_ERROR]: 500,
    [ErrorInfrastructureKey.KAFKA_PRODUCER_SEND_ERROR]: 500,
    [ErrorInfrastructureKey.KAFKA_CONSUMER_CONNECTION_ERROR]: 500,
    [ErrorInfrastructureKey.KAFKA_CONSUMER_IS_NOT_CONNECTED]: 500,
    [ErrorInfrastructureKey.KAFKA_CONSUMER_SUBSCRIBE_ERROR]: 500,
    [ErrorInfrastructureKey.KAFKA_CONSUMER_DISCONNECT_ERROR]: 500,
};

export class ErrorInfrastructure extends ErrorEntity {
    public constructor(e: {
        key: string,
        detail?: unknown,
        interpolation?: { [key: string]: unknown }
    }) {
        super({
            code: ErrorInfrastructureKeyCode[e.key],
            messageKey: `error.errorInfrastructure.${e.key}`,
            detail: e.detail,
            interpolation: e.interpolation,
        });
    }
}
