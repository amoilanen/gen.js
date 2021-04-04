export class Lazy<T> {
  constructor(private readonly value: () => T) {
  }

  force(): T {
    return this.value();
  }
}