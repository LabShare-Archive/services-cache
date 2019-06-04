import {IStorage} from '../storages/IStorage';

export abstract class AbstractBaseStrategy {
  constructor(protected storage: IStorage) {}

  public abstract async getItem<T>(key: string): Promise<T>;
  public abstract async setItem(
    key: string,
    content: any,
    options: any,
  ): Promise<void>;
  public abstract async clear(): Promise<void>;
  public abstract async deleteItem(key: string): Promise<void>;
}
