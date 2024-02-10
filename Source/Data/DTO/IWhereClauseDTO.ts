export interface IWhereClauseDTO {
    $in: string[];
    $nin: string[];
    $eq: string | number | boolean;
    $neq: string | number | boolean;
    $match: string;
    $lt: string | number;
    $lte: string | number;
    $gt: string | number;
    $gte: string | number;
}
