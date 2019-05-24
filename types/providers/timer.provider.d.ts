import { Provider } from '@loopback/context';
import { TimerFn } from '../types';
export declare class TimerProvider implements Provider<TimerFn> {
    constructor();
    value(): TimerFn;
}
