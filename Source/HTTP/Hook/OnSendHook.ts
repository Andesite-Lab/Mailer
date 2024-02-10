import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { AbstractHook } from '@/HTTP/Hook';

export class OnSendHook extends AbstractHook {
    public configure(app: FastifyInstance): void {
        app.addHook('onSend', (request: FastifyRequest, reply: FastifyReply, payload, done): void => {
            this._callback.forEach((callback: (request: FastifyRequest, reply: FastifyReply, payload: unknown) => void): void => {
                callback(request, reply, payload);
            });
            done(null, payload);
        });
    }
}
