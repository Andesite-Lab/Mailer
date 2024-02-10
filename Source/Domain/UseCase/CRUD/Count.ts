import { CrudModel } from '@/Infrastructure/Repository/Model';
import { IPaginationOptionsDTO, IWhereClauseDTO } from '@/Data/DTO';

export class Count<T extends NonNullable<unknown>> {
    private readonly _model: CrudModel<T>;

    public constructor(tableName: string) {
        this._model = new CrudModel(tableName);
    }

    public execute(
        entitiesToSearch?: Partial<T>[] | Partial<Record<keyof T, IWhereClauseDTO>>[],
        option?: IPaginationOptionsDTO
    ): Promise<number> {
        return this._model.count(entitiesToSearch, option);
    }
}
