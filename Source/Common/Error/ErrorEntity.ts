import { randomUUID } from 'crypto';

export class ErrorEntity extends Error {
    private readonly _uuidError: string = randomUUID();
    private readonly _name: string;
    private readonly _code: number;
    private readonly _interpolation?: { [key: string]: unknown };
    private readonly _detail?: unknown;
    private readonly _stack: string | undefined;

    public constructor(error: {
        code: number,
        messageKey: string,
        detail?: unknown
        interpolation?: { [key: string]: unknown }
    }) {
        super();
        this.message = error.messageKey;
        this._name = this.constructor.name;
        this._code = error.code;
        this._detail = error.detail;
        this._interpolation = error.interpolation;
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, this.constructor);
        this._stack = this.stack;
    }

    public get code(): number {
        return this._code;
    }

    public get name(): string {
        return this._name;
    }

    public get detail(): unknown {
        return this._detail;
    }

    public get uuidError(): string {
        return this._uuidError;
    }

    public get stack(): string | undefined {
        return this._stack;
    }

    public get interpolation(): { [key: string]: unknown } | undefined {
        return this._interpolation;
    }
}
