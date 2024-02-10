import { CrudModel } from '@/Infrastructure/Repository/Model';

export class UpdateAll<T extends NonNullable<unknown>> {
    private readonly _model: CrudModel<T>;

    public constructor(tableName: string) {
        this._model = new CrudModel(tableName);
    }

    public execute(newEntity: T): Promise<T[]> {
        return this._model.updateAll(newEntity);
    }
}
