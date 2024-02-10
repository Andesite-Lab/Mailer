import { ErrorEntity } from '@/Common/Error';

export enum ErrorValidatorKey {
    LIMIT_NOT_A_INTEGER = 'LIMIT_NOT_A_INTEGER',
    OFFSET_NOT_A_INTEGER = 'OFFSET_NOT_A_INTEGER',
    ID_IS_REQUIRED = 'ID_IS_REQUIRED',
    ID_NOT_A_INTEGER = 'ID_NOT_A_INTEGER',
    UUID_IS_REQUIRED = 'UUID_IS_REQUIRED',
    UUID_NOT_VALID = 'UUID_NOT_VALID',
    $IN_ARRAY_IS_EMPTY = '$IN_ARRAY_IS_EMPTY',
    $NIN_ARRAY_IS_EMPTY = '$NIN_ARRAY_IS_EMPTY',
    $EQ_NOT_VALID = '$EQ_NOT_VALID',
    $NEQ_NOT_VALID = '$NEQ_NOT_VALID',
    $MATCH_NOT_VALID = '$MATCH_NOT_VALID',
    $LT_NOT_VALID = '$LT_NOT_VALID',
    $LTE_NOT_VALID = '$LTE_NOT_VALID',
    $GT_NOT_VALID = '$GT_NOT_VALID',
    $GTE_NOT_VALID = '$GTE_NOT_VALID',
}

export class ErrorValidator extends ErrorEntity {
    public constructor(e: {
        key: string,
        detail?: unknown,
        interpolation?: { [key: string]: unknown }
    }) {
        super({
            code: 400,
            messageKey: `error.errorValidator.${e.key}`,
            detail: e.detail,
            interpolation: e.interpolation,
        });
    }
}
