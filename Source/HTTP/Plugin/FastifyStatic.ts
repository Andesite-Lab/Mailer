import { join } from 'path';
import { FastifyInstance } from 'fastify';
import staticPlugin from '@fastify/static';

import { IPlugin } from '@/HTTP/Interface';

export class FastifyStatic implements IPlugin {
    configure(app: FastifyInstance): void {
        app.register(staticPlugin, {
            root: join(__dirname, '..', 'Public/Images/'),
            decorateReply: true,
        });
    }
}
