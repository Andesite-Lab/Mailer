import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { BasaltLogger } from '@basalt-lab/basalt-logger';

import { IHook, IPlugin, IRouter } from '@/HTTP/Interface';
import { EnvironmentConfiguration, I18n, Language } from '@/Config';
import { MicroserviceRouter, TrackRouter } from '@/HTTP/Router';
import {
    CookiePlugin,
    CorsPlugin,
    FormbodyPlugin,
    HelmetPlugin,
    RateLimitPlugin,
    SwaggerPlugin,
    SwaggerUiPlugin
} from '@/HTTP/Plugin';
import { IOnRequestHttpDTO } from '@/Data/DTO';
import { OnSendHook } from '@/HTTP/Hook';

export class HttpServerManager {
    private readonly _app: FastifyInstance;

    public constructor() {
        this._app = fastify({
            ignoreTrailingSlash: true,
            trustProxy: true,
            ignoreDuplicateSlashes: true,
        });
    }

    private initializeRouter(): IRouter[] {
        return [
            new MicroserviceRouter('/microservice'),
            new TrackRouter('/mail'),
        ];
    }

    private initializePlugin(): IPlugin[] {
        return [
            new CookiePlugin(),
            new CorsPlugin(),
            new FormbodyPlugin(),
            new HelmetPlugin(),
            new RateLimitPlugin(),
            new SwaggerPlugin(),
            new SwaggerUiPlugin(),
        ];
    }

    private initializeHook(): IHook[] {
        const onSendHook: OnSendHook = new OnSendHook();
        onSendHook.callback = [
            (request: FastifyRequest, reply: FastifyReply): void => {
                const data: IOnRequestHttpDTO = {
                    ip: request.headers['x-real-ip'] as string || request.ip,
                    method: request.method,
                    url: request.url,
                    statusCode: reply.statusCode,
                    createdAt: new Date(),
                };
                BasaltLogger.log(data);
            }
        ];
        return [
            onSendHook,
        ];
    }

    private initialize(): void {
        this.initializePlugin().forEach((plugin: IPlugin) => plugin.configure(this._app));
        this.initializeRouter().forEach((router: IRouter) => router.configure(this._app, `${EnvironmentConfiguration.env.PREFIX}`));
        this.initializeHook().forEach((hook: IHook) => hook.configure(this._app));
    }

    public async start(): Promise<void> {
        this.initialize();
        await this._app.ready();
        await this._app.listen({
            host: '0.0.0.0',
            port: EnvironmentConfiguration.env.HTTP_PORT,
        });
        BasaltLogger.log(I18n.translate('http.LISTENING', Language.EN, {
            port: EnvironmentConfiguration.env.HTTP_PORT,
            mode: EnvironmentConfiguration.env.NODE_ENV,
            prefix: EnvironmentConfiguration.env.PREFIX,
            pid: process.pid,
        }));
    }

    public async stop(): Promise<void> {
        await this._app.close();
        BasaltLogger.log(I18n.translate('http.CLOSE', Language.EN));
    }
}
