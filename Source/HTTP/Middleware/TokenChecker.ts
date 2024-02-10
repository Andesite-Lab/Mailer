import { FastifyReply, FastifyRequest } from 'fastify';

import { EnvironmentConfiguration, I18n } from '@/Config';
import { GatewaysHttp } from '@/Infrastructure/External';
import { ErrorEntity } from '@/Common/Error';

export class TokenChecker {
    public static async execute(req: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const token: string = req.cookies.token || '';
            await GatewaysHttp.instance.get(`${EnvironmentConfiguration.env.AUTH_SERVICE_URL}/token/check`, {
                headers: {
                    Cookie: `token=${token}`
                }
            });
        } catch (error) {
            if (error instanceof ErrorEntity)
                reply.status(error.code).send({
                    content: I18n.translate(error.message, reply.request.headers['accept-language'], error.interpolation),
                    statusCode: error.code
                });
        }
    }
}
