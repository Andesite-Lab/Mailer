import crypto from 'crypto';

export class Hash {
    public static md5(data: unknown): string {
        const str: string = typeof data === 'string' ? data : JSON.stringify(data);
        return crypto.createHash('md5').update(str).digest('hex');
    }
}
