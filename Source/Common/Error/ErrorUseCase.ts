import { ErrorEntity } from '@/Common/Error';

export enum ErrorUseCaseKey {
}

const ErrorUseCaseKeyCode: { [p: string]: number } = {
};

export class ErrorUseCase extends ErrorEntity {
    public constructor(e: {
        key: string,
        detail?: unknown,
        interpolation?: { [key: string]: unknown }
    }) {
        super({
            code: ErrorUseCaseKeyCode[e.key],
            messageKey: `error.errorUseCase.${e.key}`,
            detail: e.detail,
            interpolation: e.interpolation,
        });
    }
}
