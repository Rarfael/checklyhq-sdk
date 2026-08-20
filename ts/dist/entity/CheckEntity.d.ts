import { ChecklyhqEntityBase } from '../ChecklyhqEntityBase';
import type { ChecklyhqSDK } from '../ChecklyhqSDK';
import type { Control } from '../types';
import type { Check, CheckLoadMatch, CheckListMatch, CheckCreateData, CheckUpdateData, CheckRemoveMatch } from '../ChecklyhqTypes';
declare class CheckEntity extends ChecklyhqEntityBase<Check> {
    constructor(client: ChecklyhqSDK, entopts: any);
    make(this: CheckEntity): CheckEntity;
    load(this: any, reqmatch?: CheckLoadMatch, ctrl?: Control): Promise<CheckEntity>;
    list(this: any, reqmatch?: CheckListMatch, ctrl?: Control): Promise<CheckEntity[]>;
    create(this: any, reqdata?: CheckCreateData, ctrl?: Control): Promise<CheckEntity>;
    update(this: any, reqdata?: CheckUpdateData, ctrl?: Control): Promise<CheckEntity>;
    remove(this: any, reqmatch?: CheckRemoveMatch, ctrl?: Control): Promise<CheckEntity>;
}
export { CheckEntity };
