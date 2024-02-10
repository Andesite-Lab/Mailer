import {
    IsOptional,
    ArrayNotEmpty,
    IsString,
    IsNumber,
    IsBoolean,
    ValidateIf,
} from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

import { ErrorValidatorKey } from '@/Common/Error';

@JSONSchema({
    title: 'WhereClauseValidator schema',
})
export class WhereClauseValidator<T> {
    @ArrayNotEmpty({
        message: ErrorValidatorKey.$IN_ARRAY_IS_EMPTY
    })
    @IsOptional()
    public $in: string[] | undefined;

    @ArrayNotEmpty({
        message: ErrorValidatorKey.$IN_ARRAY_IS_EMPTY
    })
    @IsOptional()
    public $nin: string[] | undefined;

    @ValidateIf(o => typeof o.$eq === 'string')
    @IsString({ message: ErrorValidatorKey.$EQ_NOT_VALID })
    @ValidateIf(o => typeof o.$eq === 'number')
    @IsNumber({}, { message: ErrorValidatorKey.$EQ_NOT_VALID })
    @ValidateIf(o => typeof o.$eq === 'boolean')
    @IsBoolean({ message: ErrorValidatorKey.$EQ_NOT_VALID })
    @IsOptional()
    public $eq: string | number | boolean | undefined;

    @ValidateIf(o => typeof o.$neq === 'string')
    @IsString({ message: ErrorValidatorKey.$NEQ_NOT_VALID })
    @ValidateIf(o => typeof o.$neq === 'number')
    @IsNumber({}, { message: ErrorValidatorKey.$NEQ_NOT_VALID })
    @ValidateIf(o => typeof o.$neq === 'boolean')
    @IsBoolean({ message: ErrorValidatorKey.$NEQ_NOT_VALID })
    @IsOptional()
    public $neq: string | number | boolean | undefined;

    @IsString({ message: ErrorValidatorKey.$MATCH_NOT_VALID })
    @IsOptional()
    public $match: string | undefined;

    @ValidateIf(o => typeof o.$lt === 'string')
    @IsString({ message: ErrorValidatorKey.$LT_NOT_VALID })
    public $lt: string | number | undefined;

    @ValidateIf(o => typeof o.$lte === 'string')
    @IsString({ message: ErrorValidatorKey.$LTE_NOT_VALID })
    public $lte: string | number | undefined;

    @ValidateIf(o => typeof o.$gt === 'string')
    @IsString({ message: ErrorValidatorKey.$GT_NOT_VALID })
    public $gt: string | number | undefined;

    @ValidateIf(o => typeof o.$gte === 'string')
    @IsString({ message: ErrorValidatorKey.$GTE_NOT_VALID })
    public $gte: string | number | undefined;

    public constructor(body: T) {
        Object.assign(this, body);
    }
}
