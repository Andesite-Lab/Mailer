import { FastifyInstance } from 'fastify';

export interface IRouter {
    configure(app: FastifyInstance, url: string): void;
}
