import { Maybe } from './maybe';

export abstract class Generator<T> {

  abstract generate(): Maybe<T>

  map<U>(f: (value: T) => U): Generator<U> {
    return this.flatMap(value => Generator.pure(f(value)));
  }

  flatMap<U>(f: (value: T) => Generator<U>): Generator<U> {
    let originalGenerator = this;
    return new (class extends Generator<U> {
      generate() {
        return originalGenerator.generate().flatMap(x => f(x).generate());
      }
    });
  }

  static pure<T>(value: T): Generator<T> {
    return new SingleValueGenerator(value);
  }
}

class SingleValueGenerator<T> extends Generator<T> {
  generatedValue: Maybe<T>;
  constructor(value: T) {
    super();
    this.generatedValue = Maybe.pure(value);
  }
  generate(): Maybe<T> {
    return this.generatedValue;
  }
}