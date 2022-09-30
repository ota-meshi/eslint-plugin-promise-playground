export type MaybePromise<T> = T | Promise<T>;
export type RulesConfig = Record<string, 'error' | 'warn' | 'off' | 2 | 1 | 0 | undefined>;
