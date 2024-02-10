import { FastifyInstance } from 'fastify';

export interface IHook {
    configure(app: FastifyInstance): void;
}
