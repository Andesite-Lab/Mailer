import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';

import { IPlugin } from '@/HTTP/Interface';
import { EnvironmentConfiguration } from '@/Config';

export class CorsPlugin implements IPlugin {
    configure(app: FastifyInstance): void {
        app.register(cors,
            {
                origin: EnvironmentConfiguration.env.ORIGINS,
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
                credentials: true,
                optionsSuccessStatus: 200,
                preflightContinue: true
            }
        );
    }
}
