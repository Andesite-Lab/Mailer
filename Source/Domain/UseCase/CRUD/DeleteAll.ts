import { CrudModel } from '@/Infrastructure/Repository/Model';

export class DeleteAll<T extends NonNullable<unknown>> {
    private readonly _model: CrudModel<T>;

    public constructor(tableName: string) {
        this._model = new CrudModel(tableName);
    }

    public execute(): Promise<T[]> {
        return this._model.deleteAll();
    }
}
