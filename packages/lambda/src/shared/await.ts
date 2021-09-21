export type Await<T> = T extends PromiseLike<infer U> ? U : T;
