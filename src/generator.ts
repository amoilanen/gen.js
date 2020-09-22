import { Maybe, None, Some, none } from './maybe';

//TODO: Add tests for the methods added as a result of a quick spike/prototyping

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

  //TODO:
  //flatMap
}

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
          return Maybe.from<number>(Math.random() * (this.max - this.min) + this.min);
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

  static forValue<T>(value: T): Generator<T> {
    let generatedValue = new Some(value);
    return new (class extends Generator<T> {

      generate() {
        return generatedValue;
      }
    })();
  }

  static oneOfValues<T>(...values: Array<T>): Generator<T> {
    let generators = values.map(value => this.forValue(value));
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

  static object<T1, T2, T3, T4, U>(g1: Generator<T1>, g2: Generator<T2>, g3: Generator<T3>, g4: Generator<T4>, objectConstructor: new (x1: T1, x2: T2, x3: T3, x4: T4) => U): Generator<U> {
    return new (class extends Generator<U> {
      generate(): Maybe<U> {
        return g1.generate().flatMap(x1 =>
          g2.generate().flatMap(x2 =>
            g3.generate().flatMap(x3 =>
              g4.generate().map(x4 =>
                new objectConstructor(x1, x2, x3, x4)
              )
            )
          )
        )
      }
    });
  }
};
