import {
    IsInt,
    IsOptional
} from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

import { ErrorValidatorKey } from '@/Common/Error';

@JSONSchema({
    title: 'PaginationOptionsValidator schema',
})
export class PaginationOptionsValidator<T> {
    @IsInt({
        message: ErrorValidatorKey.LIMIT_NOT_A_INTEGER,
    })
    @IsOptional()
    public limit: number | undefined;

    @IsInt({
        message: ErrorValidatorKey.OFFSET_NOT_A_INTEGER,
    })
    @IsOptional()
    public offset: number | undefined;

    public constructor(body: T) {
        Object.assign(this, body);
    }
}
