import {
    IsUUID,
    IsDefined
} from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { faker } from '@faker-js/faker';

import { ErrorValidatorKey } from '@/Common/Error';

@JSONSchema({
    title: 'UuidValidator schema',
})
export class UuidValidator {
    @IsUUID(4, {
        message: ErrorValidatorKey.UUID_NOT_VALID,
    })
    @IsDefined({
        message: ErrorValidatorKey.UUID_IS_REQUIRED,
    })
    @JSONSchema({
        description: 'UUID of the user',
        examples: [faker.string.uuid()],
    })
    public uuid: string | undefined;

    public constructor(uuid: string | undefined) {
        this.uuid = uuid;
    }
}
