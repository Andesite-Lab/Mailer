import { IHook } from '@/HTTP/Interface';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export abstract class AbstractHook implements IHook {
    protected _callback: Array<(request: FastifyRequest, reply: FastifyReply, payload?: unknown) => void>;

    public constructor() {
        this._callback = [];
    }

    public set callback(callback: Array<(request: FastifyRequest, reply: FastifyReply, payload?: unknown) => void>) {
        this._callback = callback;
    }

    public get callback(): Array<(request: FastifyRequest, reply: FastifyReply, payload?: unknown) => void> {
        return this._callback;
    }

    abstract configure(app: FastifyInstance): void;
}
