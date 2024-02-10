import { CrudModel } from '@/Infrastructure/Repository/Model';
import { IPaginationOptionsDTO, IWhereClauseDTO } from '@/Data/DTO';

export class Find<T extends NonNullable<unknown>> {
    private readonly _model: CrudModel<T>;

    public constructor(tableName: string) {
        this._model = new CrudModel(tableName);
    }

    public execute(entities: Partial<T>[] | Partial<Record<keyof T, IWhereClauseDTO>>[], option: IPaginationOptionsDTO | undefined): Promise<T[]> {
        return this._model.find(entities, {}, option);
    }
}
