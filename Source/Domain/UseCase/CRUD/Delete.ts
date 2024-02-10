import { CrudModel } from '@/Infrastructure/Repository/Model';
import { IWhereClauseDTO } from '@/Data/DTO';

export class Delete<T extends NonNullable<unknown>> {
    private readonly _model: CrudModel<T>;

    public constructor(tableName: string) {
        this._model = new CrudModel(tableName);
    }

    public execute(entitiesToUpdate: Partial<T>[] | Partial<Record<keyof T, IWhereClauseDTO>>[]): Promise<T[]> {
        return this._model.delete(entitiesToUpdate);
    }
}
