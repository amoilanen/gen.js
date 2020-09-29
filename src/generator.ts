import { Maybe, Some, none } from './maybe';

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

type G<T> = Generator<T>

export class Generators {

  static choose(min: number, max: number): Generator<number> {
    return new (class extends Generator<number> {

      constructor(readonly min: number, readonly max: number) {
        super();
      }

      generate() {
        if (this.max < this.min) {
          return none;
        } else {
          return Maybe.pure<number>(Math.random() * (this.max - this.min) + this.min);
        }
      }
    })(min, max);
  }

  static never<T>(): Generator<T> {
    return new (class extends Generator<T> {
      generate() {
        return none;
      }
    });
  }

  static pure<T>(value: T): Generator<T> {
    let generatedValue = new Some(value);
    return new (class extends Generator<T> {

      generate() {
        return generatedValue;
      }
    })();
  }

  //TODO: Add tests for the methods added as a result of a quick spike/prototyping
  static oneOfValues<T>(...values: Array<T>): Generator<T> {
    let generators = values.map(value => this.pure(value));
    return this.oneOf(...generators);
  }

  static oneOf<T>(...generators: Array<Generator<T>>): Generator<T> {
    return new (class extends Generator<T> {

      generate() {
        let randomIndex = Math.floor(Math.min(
          Math.random() * generators.length,
          generators.length - 1
        ));
        let randomGenerator = generators[randomIndex];
        return randomGenerator.generate();
      }
    })();
  }

  static pair<A, B>(first: Generator<A>, second: Generator<B>): Generator<[A, B]> {
    return new (class extends Generator<[A, B]> {
      generate(): Maybe<[A, B]> {
        return first.generate().flatMap(firstValue =>
          second.generate().map(secondValue => [firstValue, secondValue])
        );
      }
    });
  }

  static object<R>(objectConstructor: new () => R): G<R>
  static object<R, T1>(objectConstructor: new (x1: T1) => R, g1: G<T1>): G<R>
  static object<R, T1, T2>(objectConstructor: new (x1: T1, x2: T2) => R, g1: G<T1>, g2: G<T2>): G<R>
  static object<R, T1, T2, T3>(objectConstructor: new (x1: T1, x2: T2, x3: T3) => R, g1: G<T1>, g2: G<T2>, g3: G<T3>): G<R>
  static object<R, T1, T2, T3, T4>(objectConstructor: new (x1: T1, x2: T2, x3: T3, x4: T4) => R, g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>): G<R>
  static object<R, T1, T2, T3, T4, T5>(objectConstructor: new (x1: T1, x2: T2, x3: T3, x4: T4, x5: T5) => R,
    g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>): G<R>
  static object<R, T1, T2, T3, T4, T5, T6>(objectConstructor: new (x1: T1, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6) => R,
    g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>, g6: G<T6>): G<R>
  static object<R, T1, T2, T3, T4, T5, T6, T7>(objectConstructor: new (x1: T1, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6, x7: T7) => R,
    g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>, g6: G<T6>, g7: G<T7>): G<R>
  static object<R, T1, T2, T3, T4, T5, T6, T7, T8>(objectConstructor: new (x1: T1, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6, x7: T7, x8: T8) => R,
    g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>, g6: G<T6>, g7: G<T7>, g8: G<T8>): G<R>
  static object<R, T1, T2, T3, T4, T5, T6, T7, T8, T9>(objectConstructor: new (x1: T1, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6, x7: T7, x8: T8, x9: T9) => R,
    g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>, g6: G<T6>, g7: G<T7>, g8: G<T8>, g9: G<T9>): G<R>
  static object<R, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(objectConstructor: new (x1: T1, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6, x7: T7, x8: T8, x9: T9, x10: T10) => R,
    g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>, g6: G<T6>, g7: G<T7>, g8: G<T8>, g9: G<T9>, g10: G<T10>): G<R>

  static object<R>(objectConstructor: new (...args: any[]) => R, ...fieldGenerators: Array<Generator<any>>): Generator<R> {
    return new (class extends Generator<R> {
      generate(): Maybe<R> {
        let generatedFields = fieldGenerators.map(g => g.generate())
          .filter(v => v.isDefined).map(v => v.value);

        if (generatedFields.length < fieldGenerators.length) {
          return none;
        } else {
          return new Some(new objectConstructor(...generatedFields));
        }
      }
    });
  }
};
