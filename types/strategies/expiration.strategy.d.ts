import { IStorage } from '../storages/IStorage';
import { AbstractBaseStrategy } from './abstract.base.strategy';
import { IOptions } from '../types';
export declare class ExpirationStrategy extends AbstractBaseStrategy {
    constructor(storage: IStorage);
    getItem<T>(key: string): Promise<T>;
    setItem(key: string, content: any, options: IOptions): Promise<void>;
    deleteItem(key: string): Promise<void>;
    clear(): Promise<void>;
    private isItemExpired;
    private unsetKey;
}
