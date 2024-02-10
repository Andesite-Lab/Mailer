import { FastifyReply, FastifyRequest } from 'fastify';
import { BasaltLogger } from '@basalt-lab/basalt-logger';

import { AbstractHandler } from '@/HTTP/Handler';
import { TrackReadMail } from '@/Domain/UseCase';

export class TrackHandler extends AbstractHandler {
    private readonly _trackReadMailUseCase: TrackReadMail = new TrackReadMail();

    public piqueSel = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
        try {
            const filteredUuid: { uuid: string } = this._basaltKeyInclusionFilter
                .filter<{ uuid: string }>(req.params as { uuid: string }, ['uuid'], true);
            await this._trackReadMailUseCase.execute(filteredUuid.uuid);
            await reply
                .type('image/png')
                .sendFile('pique-sel.png');
        } catch (e) {
            if (e instanceof Error)
                BasaltLogger.error({
                    error: e,
                    trace: e.stack,
                });
            this.sendError(reply, e);
        }
    };
}
