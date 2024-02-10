import { FastifyReply, FastifyRequest } from 'fastify';

import { AbstractHandler } from '@/HTTP/Handler';
import { I18n } from '@/Config/I18n';
import { packageJsonConfiguration } from '@/Config';

export class MicroserviceHandler extends AbstractHandler {
    public ping = (_: FastifyRequest, reply: FastifyReply): void => this.sendResponse(reply, 200, I18n.translate('http.handler.microserviceHandler.ping', reply.request.headers['accept-language']));

    public info = (_: FastifyRequest, reply: FastifyReply): void => {
        this.sendResponse(
            reply,
            200,
            I18n.translate('http.handler.microserviceHandler.info', reply.request.headers['accept-language']),
            {
                name: packageJsonConfiguration.name,
                description: packageJsonConfiguration.description,
                version: packageJsonConfiguration.version
            });
    };
}
