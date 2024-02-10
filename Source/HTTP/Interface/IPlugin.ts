import { FastifyInstance } from 'fastify';

export interface IPlugin {
    configure(app: FastifyInstance): void;
}
