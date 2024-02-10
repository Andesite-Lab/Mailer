import { FastifyInstance } from 'fastify';
import { fastifySwaggerUi, FastifySwaggerUiOptions } from '@fastify/swagger-ui';
import { readFileSync } from 'fs';
import { join } from 'path';

import { IPlugin } from '@/HTTP/Interface';
import { EnvironmentConfiguration, packageJsonConfiguration } from '@/Config';

export class SwaggerUiPlugin implements IPlugin {
    configure(app: FastifyInstance): void {
        const pathAssets: string = join(__dirname, '../Assets');
        const swaggerUiOptions: FastifySwaggerUiOptions = {
            routePrefix: `${EnvironmentConfiguration.env.PREFIX}/swagger`,
            theme: {
                title: `${packageJsonConfiguration.name} - API`,
                favicon: [
                    {
                        filename: 'android-chrome-192x192',
                        rel: 'icon',
                        type: 'image/png',
                        sizes: '192x192',
                        content: readFileSync(join(pathAssets, '/Logo/android-chrome-192x192.png')),
                    },

                    {
                        filename: 'android-chrome-512x512',
                        rel: 'icon',
                        type: 'image/png',
                        sizes: '512x512',
                        content: readFileSync(join(pathAssets, '/Logo/android-chrome-512x512.png')),
                    },
                    {
                        filename: 'apple-touch-icon',
                        rel: 'icon',
                        type: 'image/png',
                        sizes: '180x180',
                        content: readFileSync(join(pathAssets, '/Logo/apple-touch-icon.png')),
                    },
                    {
                        filename: 'favicon-16x16',
                        rel: 'icon',
                        type: 'image/png',
                        sizes: '16x16',
                        content: readFileSync(join(pathAssets, '/Logo/favicon-16x16.png')),
                    },
                    {
                        filename: 'favicon-32x32',
                        rel: 'icon',
                        type: 'image/png',
                        sizes: '32x32',
                        content: readFileSync(join(pathAssets, '/Logo/favicon-32x32.png')),
                    },
                    {
                        filename: 'favicon',
                        rel: 'shortcut icon',
                        type: 'image/x-icon',
                        sizes: '16x16',
                        content: readFileSync(join(pathAssets, '/Logo/favicon.ico')),
                    },
                ] as { filename: string; rel: string; type: string; sizes: string; content: string | Buffer; }[]
            },
            logo: {
                type: 'image/png',
                content: readFileSync(join(pathAssets, '/Logo/logo.png')),
            }

        };
        app.register(fastifySwaggerUi, swaggerUiOptions);
    }
}
