import { FastifyReply } from 'fastify';
import { validate, ValidationError } from 'class-validator';
import { BasaltKeyInclusionFilter } from '@basalt-lab/basalt-helper';

import { EnvironmentConfiguration, I18n } from '@/Config';
import { ErrorEntity } from '@/Common/Error';

export abstract class AbstractHandler {
    protected readonly _basaltKeyInclusionFilter: BasaltKeyInclusionFilter = new BasaltKeyInclusionFilter();

    protected clearCookie(reply: FastifyReply, name: string): void {
        reply.clearCookie(name, {
            path: '/',
            httpOnly: false,
            secure: EnvironmentConfiguration.env.NODE_ENV === 'production',
            sameSite: 'strict',
            signed: true
        });
    }

    protected addCookie(reply: FastifyReply, name: string, value: string, expiration: number): void {
        reply.setCookie(name, value, {
            path: '/',
            httpOnly: false,
            secure: EnvironmentConfiguration.env.NODE_ENV === 'production',
            maxAge: expiration,
            sameSite: 'strict',
            signed: true,
        });
    }

    protected sendError(reply: FastifyReply, error: unknown): void {
        if (error instanceof ErrorEntity)
            reply.status(error.code).send({
                content: I18n.translate(error.message, reply.request.headers['accept-language'], error.interpolation),
                statusCode: error.code
            });
        else if (Array.isArray(error))
            reply.status(400).send({
                content: error.map(e => {
                    return {
                        property: e.property,
                        constraints: e.constraints
                    };
                }),
                statusCode: 400
            });
        else
            reply.status(500).send({
                content: 'Internal Server Error',
                statusCode: 500
            });
    }

    protected sendResponse<T>(reply: FastifyReply, statusCode: number, message: string, content?: T): void {
        reply.status(statusCode).send({
            message,
            content,
            statusCode,
        });
    }

    protected async validate(obj: object, lang: string = 'en'): Promise<void> {
        const errors: ValidationError[] = await validate(obj);
        if (errors.length === 0)
            return;
        for (const error of errors) {
            const constraints: { [type: string]: string; } = error.constraints || {};
            for (const key in constraints)
                constraints[key] = I18n.translate(`error.errorValidator.${constraints[key]}`, lang);
        }
        throw errors;
    }
}
