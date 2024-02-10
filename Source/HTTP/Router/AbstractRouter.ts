import { FastifyInstance, FastifyPluginAsync } from 'fastify';

import { IRouter } from '@/HTTP/Interface';

export abstract class AbstractRouter<T> implements IRouter {
    protected _handler: T;
    private readonly _routerPrefix: string;

    protected constructor(controller: T, routerPrefix: string) {
        this._handler = controller;
        this._routerPrefix = routerPrefix;
    }

    protected abstract initRoutes(fastify: FastifyInstance): void;

    public configure(app: FastifyInstance, base: string): void {
        app.register(this._router, { prefix: `${base}${this._routerPrefix}` });
    }

    private get _router(): FastifyPluginAsync {
        return async (fastify: FastifyInstance): Promise<void> => {
            this.initRoutes(fastify);
        };
    }
}
