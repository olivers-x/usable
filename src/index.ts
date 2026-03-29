type Task<T> = (
  resolve: (value: T | PromiseLike<T>) => void,
  reject: (reason?: unknown) => void,
) => void;

export default class UsablePromise<T> extends Promise<T> {
  private task: Task<T>;
  private usablePromise?: Promise<T>;

  constructor(task: Task<T>) {
    super((resolve) => {
      resolve(undefined as T);
    });

    this.task = task;
  }

  then<TResult1 = T, TResult2 = never>(
    onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onRejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    this.usablePromise ??= new Promise(this.task);
    return this.usablePromise.then(onFulfilled, onRejected);
  }
}

export function createUsable<T>(
  promise: () => T | PromiseLike<T>,
): UsablePromise<T> {
  return new UsablePromise<T>((resolve) => {
    resolve(promise());
  });
}
