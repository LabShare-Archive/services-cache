import {StorageProvider} from './storage-provider';
import {MemoryConfig} from '../types';
let memCache: any = {};
export class MemoryStorage implements StorageProvider {
  private localMemoryCache: any = {};
  constructor(private memoryConfig?: MemoryConfig) {}

  public async getItem<T>(key: string): Promise<T> {
    return this.client[key];
  }

  public async setItem(key: string, content: any): Promise<void> {
    this.client[key] = content;
  }

  public async deleteItem(key: string): Promise<void> {
    return this.client[key];
  }

  public async clear(): Promise<void> {
    this.client = {};
  }

  private get client() {
    if (this.memoryConfig?.isGlobalCache) {
      return memCache;
    } else {
      return this.localMemoryCache;
    }
  }
  private set client(value) {
    if (this.memoryConfig?.isGlobalCache) {
      memCache = value;
    } else {
      this.localMemoryCache = value;
    }
  }
}
