/// <reference types="express" />
export interface IExpiringCacheItem {
    content: any;
    meta: {
        createdAt: number;
        ttl: number;
    };
}
export interface IOptions {
    ttl?: number;
    isLazy?: boolean;
    isCachedForever?: boolean;
    cacheKey?: string;
    noop?: boolean;
    refreshCache?: boolean;
}
import { Request, OperationArgs } from '@loopback/rest';
export interface LogFn {
    (req: Request, args: OperationArgs, result: any, startTime?: HighResTime): Promise<void>;
    startTimer(): HighResTime;
}
export declare type LevelMetadata = {
    level: number;
};
export declare type HighResTime = [number, number];
export declare type LogWriterFn = (msg: string, level: number) => void;
export declare type TimerFn = (start?: HighResTime) => HighResTime;
