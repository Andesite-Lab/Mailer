import {
    author,
    dependencies,
    description,
    devDependencies,
    keywords,
    license,
    main,
    name,
    scripts,
    version
} from '../../package.json';

export interface IPackageJson {
    version: string;
    author: string;
    name: string;
    description: string;
    main: string;
    keywords: string[];
    license: string;
    scripts: {
        [key: string]: string;
    }
    dependencies: {
        [key: string]: string;
    },
    devDependencies: {
        [key: string]: string;
    },
}

export const packageJsonConfiguration: IPackageJson = {
    version,
    author,
    dependencies,
    devDependencies,
    name,
    description,
    main,
    keywords,
    license,
    scripts
};
