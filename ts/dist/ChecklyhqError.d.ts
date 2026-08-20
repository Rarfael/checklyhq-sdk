import { Context } from './Context';
declare class ChecklyhqError extends Error {
    isChecklyhqError: boolean;
    sdk: string;
    code: string;
    ctx: Context;
    status: number;
    get notFound(): boolean;
    constructor(code: string, msg: string, ctx: Context);
}
export { ChecklyhqError };
