import { FastifyInstance } from 'fastify';

import { AbstractRouter } from '@/HTTP/Router';
import { MicroserviceHandler } from '@/HTTP/Handler';

export class MicroserviceRouter extends AbstractRouter<MicroserviceHandler> {
    public constructor(routerPrefix: string = '/microservice') {
        super(new MicroserviceHandler(), routerPrefix);
    }

    protected initRoutes(fastify: FastifyInstance): void {
        fastify.route({
            method: 'GET',
            url: '/ping',
            handler: this._handler.ping,
            schema: {
                tags: ['Microservice'],
                summary: 'Check the health of the server',
                security: []
            },
            attachValidation: true
        });

        fastify.route({
            method: 'GET',
            url: '/info',
            handler: this._handler.info,
            schema: {
                tags: ['Microservice'],
                summary: 'Get the server information',
                security: []
            },
            attachValidation: true
        });
    }
}
