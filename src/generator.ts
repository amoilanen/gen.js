import { Maybe } from './maybe';

export abstract class Generator<T> {

  abstract generate(): Maybe<T>

  map<U>(f: (value: T) => U): Generator<U> {
    let original = this;
    return new (class extends Generator<U> {
      generate() {
        return original.generate().map(x => f(x));
      }
    });
  }

  flatMap<U>(f: (value: T) => Generator<U>): Generator<U> {
    let original = this;
    return new (class extends Generator<U> {
      generate() {
        return original.generate().flatMap(x => f(x).generate());
      }
    });
  }
}