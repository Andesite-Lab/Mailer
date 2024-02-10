import { FastifyInstance } from 'fastify';
import formBody from '@fastify/formbody';

import { IPlugin } from '@/HTTP/Interface';

export class FormbodyPlugin implements IPlugin {
    configure(app: FastifyInstance): void {
        app.register(formBody);
    }
}
