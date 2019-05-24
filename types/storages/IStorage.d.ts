interface ICacheEntry {
    content: any;
    meta: any;
}
export interface IStorage {
    getItem<T>(key: string): Promise<T>;
    setItem(key: string, content: ICacheEntry): Promise<void>;
    deleteItem(key: string): Promise<void>;
    clear(): Promise<void>;
}
export {};
