import { CrudModel } from '@/Infrastructure/Repository/Model';
import { IPaginationOptionsDTO } from '@/Data/DTO';

export class FindAll<T extends NonNullable<unknown>> {
    private readonly _model: CrudModel<T>;

    public constructor(tableName: string) {
        this._model = new CrudModel(tableName);
    }

    public execute(paginationOptions: Partial<IPaginationOptionsDTO> | undefined): Promise<T[]> {
        return this._model.findAll({}, {
            limit: paginationOptions?.limit ? paginationOptions.limit : undefined,
            offset: paginationOptions?.offset ? paginationOptions.offset : undefined,
        });
    }
}
