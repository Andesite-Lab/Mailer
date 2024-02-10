import { IMailOptionsConsumer } from '@/Worker/Interface';

export interface IMailConsumer {
    object: unknown;
    options: IMailOptionsConsumer;
}
