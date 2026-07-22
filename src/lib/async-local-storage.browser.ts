type Callback<TResult, TArgs extends unknown[]> = (...args: TArgs) => TResult;

export class AsyncLocalStorage<TStore> {
  private currentStore: TStore | undefined;

  run<TResult, TArgs extends unknown[]>(
    store: TStore,
    callback: Callback<TResult, TArgs>,
    ...args: TArgs
  ): TResult {
    const previousStore = this.currentStore;
    this.currentStore = store;

    try {
      const result = callback(...args);
      if (result instanceof Promise) {
        return result.finally(() => {
          this.currentStore = previousStore;
        }) as TResult;
      }

      this.currentStore = previousStore;
      return result;
    } catch (error) {
      this.currentStore = previousStore;
      throw error;
    }
  }

  getStore(): TStore | undefined {
    return this.currentStore;
  }

  enterWith(store: TStore): void {
    this.currentStore = store;
  }

  exit<TResult, TArgs extends unknown[]>(
    callback: Callback<TResult, TArgs>,
    ...args: TArgs
  ): TResult {
    const previousStore = this.currentStore;
    this.currentStore = undefined;

    try {
      return callback(...args);
    } finally {
      this.currentStore = previousStore;
    }
  }

  disable(): void {
    this.currentStore = undefined;
  }
}
