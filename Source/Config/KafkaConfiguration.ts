import { KafkaConfig } from 'kafkajs';

import { packageJsonConfiguration } from './PackageJsonConfiguration';
import { EnvironmentConfiguration } from './Environnement';

export const kafkaConfiguration: KafkaConfig = {
    clientId: packageJsonConfiguration.name,
    retry: {
        retries: 3,
        initialRetryTime: 100,
    },
    requestTimeout: 5000,
    logLevel: 0,
    brokers: EnvironmentConfiguration.env.RED_PANDA_BROKERS
};
