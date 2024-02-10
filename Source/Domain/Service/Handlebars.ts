import { readdirSync, readFileSync, watch } from 'fs';
import { join } from 'path';
import handle from 'handlebars';

import { ErrorService, ErrorServiceKey } from '@/Common/Error';

export class Handlebars {
    private static _instance: Handlebars;
    private template: Map<string, handle.TemplateDelegate> = new Map<string, handle.TemplateDelegate>();

    private constructor() {
        this.loadTemplates();
        this.watchTemplates();
    }

    private loadTemplates(): void {
        readdirSync(join(__dirname, '../Templates')).forEach(file => {
            const template: string = readFileSync(join(__dirname, '../Templates', file), 'utf8');
            this.template.set(file, handle.compile(template));
        });
    }

    private watchTemplates(): void {
        watch(join(__dirname, '../Templates'), (event: 'rename' | 'change'): void => {
            if (event === 'change' || event === 'rename')
                this.loadTemplates();
        });
    }

    public static get instance (): Handlebars {
        if (!Handlebars._instance)
            Handlebars._instance = new Handlebars();
        return Handlebars._instance;
    }

    public render(template: string, context: unknown): string {
        if (!this.template.has(template))
            throw new ErrorService({
                key: ErrorServiceKey.HANDLEBARS_TEMPLATE_NOT_FOUND,
            });
        return this.template.get(template)!(context);
    }
}
