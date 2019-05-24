import { IStorage } from '../storages/IStorage';
export declare abstract class AbstractBaseStrategy {
    protected storage: IStorage;
    constructor(storage: IStorage);
    abstract getItem<T>(key: string): Promise<T>;
    abstract setItem(key: string, content: any, options: any): Promise<void>;
    abstract clear(): Promise<void>;
    abstract deleteItem(key: string): Promise<void>;
}
