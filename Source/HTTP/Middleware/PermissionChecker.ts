import { BasaltToken } from '@basalt-lab/basalt-auth';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ITokenPayloadDTO } from '@/Data/DTO';
import { BasaltAuthorization } from '@/Common';
import { ErrorEntity, ErrorMiddleware, ErrorMiddlewareKey } from '@/Common/Error';
import { I18n } from '@/Config';

export class PermissionChecker {
    public static getPayload(token: string): ITokenPayloadDTO {
        try {
            const basaltToken: BasaltToken = new BasaltToken();
            return basaltToken.getPayload(token);
        } catch (error) {
            if ((error as Error).message === 'Invalid token structure')
                throw new ErrorMiddleware({
                    key: ErrorMiddlewareKey.TOKEN_INVALID_STRUCTURE,
                });
            return {} as ITokenPayloadDTO;
        }
    }

    public static execute(permissionsToSearch: string[], multiple: boolean) {
        return function (req: FastifyRequest, reply: FastifyReply, next: () => void): void {
            try {
                const token: string = req.cookies.token || '';
                const tokenPayload: ITokenPayloadDTO = PermissionChecker.getPayload(token);
                if (!multiple) {
                    if (!BasaltAuthorization.instance.checkContainOneOfPermissions(permissionsToSearch, tokenPayload.rolePermission))
                        throw new ErrorMiddleware({
                            key: ErrorMiddlewareKey.PERMISSION_DENIED,
                        });
                }
                else {
                    if (!BasaltAuthorization.instance.checkContainAllOfPermissions(permissionsToSearch, tokenPayload.rolePermission))
                        throw new ErrorMiddleware({
                            key: ErrorMiddlewareKey.PERMISSION_DENIED,
                        });
                }
                next();
            } catch (error) {
                if (error instanceof ErrorEntity)
                    reply.status(error.code).send({
                        code: error.code,
                        content: I18n.translate(error.message, reply.request.headers['accept-language'], error.interpolation)
                    });
            }
        };
    }
}










