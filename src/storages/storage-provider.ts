interface CacheEntry {
  content: any;
  meta: any;
}

export interface StorageProvider {
  getItem<T>(key: string): Promise<T>;

  setItem(key: string, content: CacheEntry | undefined): Promise<void>;

  deleteItem(key: string): Promise<void>;

  clear(): Promise<void>;
}
