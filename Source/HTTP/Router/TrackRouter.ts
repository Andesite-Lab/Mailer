import { FastifyInstance } from 'fastify';

import { AbstractRouter } from '@/HTTP/Router';
import { TrackHandler } from '@/HTTP/Handler';

export class TrackRouter extends AbstractRouter<TrackHandler> {
    public constructor(routerPrefix: string = '/track') {
        super(new TrackHandler(), routerPrefix);
    }

    protected initRoutes(fastify: FastifyInstance): void {
        fastify.route({
            method: 'GET',
            url: '/:uuid',
            handler: this._handler.piqueSel,
            schema: {
                tags: ['Mail'],
                summary: 'Get image pique sel',
                security: []
            },
            attachValidation: true
        });
    }
}
