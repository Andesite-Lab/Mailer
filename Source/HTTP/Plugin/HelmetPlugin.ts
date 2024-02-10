import { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';

import { IPlugin } from '@/HTTP/Interface';

export class HelmetPlugin implements IPlugin {
    configure(app: FastifyInstance): void {
        app.register(helmet, { global: true });
    }
}
