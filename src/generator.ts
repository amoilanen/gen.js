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

function asciiCode(char: string): number {
  return char.codePointAt(0);
}

const capitalLettersASCIIStart = asciiCode('A');
const capitalLettersASCIIEnd = asciiCode('Z');

const lettersASCIIStart = asciiCode('a');
const lettersASCIIEnd = asciiCode('z');

const digitsASCIIStart = asciiCode('0');
const digitsASCIIEnd = asciiCode('9');

export class Generators {

  static asciiRange(from: number, to: number): Generator<string> {
    return this.choose(from, to)
      .map(charCode => String.fromCharCode(charCode))
  }

  static alphaChar(): Generator<string> {
    return this.oneOf(this.alphaLowerChar(), this.alphaUpperChar());
  }

  static alphaLowerChar(): Generator<string> {
    return this.asciiRange(lettersASCIIStart, lettersASCIIEnd);
  }

  static alphaUpperChar(): Generator<string> {
    return this.asciiRange(capitalLettersASCIIStart, capitalLettersASCIIEnd);
  }

  static numChar(): Generator<string> {
    return this.asciiRange(digitsASCIIStart, digitsASCIIEnd);
  }

  static alphaNumChar(): Generator<string> {
    return this.oneOf(this.alphaChar(), this.numChar());
  }

  static times<T>(timesNumber: number, generator: Generator<T>): Generator<Array<T>> {
    timesNumber = Math.max(timesNumber, 0);
    const generators = [...Array(timesNumber)].map(_ => generator);
    return this.nTuple(...generators);
  }

  static hexChar(): Generator<string> {
    return this.oneOf(
      this.numChar(),
      this.asciiRange(
        asciiCode('A'),
        asciiCode('F')
      )
    );
  }

  static concat(...generators: Array<Generator<string>>): Generator<string> {
    return this.nTuple(...generators).map(values => values.join(''));
  }

  static repeat(times: number, stringGenerator: Generator<string>): Generator<string> {
    return this.times(times, stringGenerator).map(_ => _.join(''));
  }

  static alphaNumString(length: number): Generator<string> {
    return this.repeat(length, this.alphaNumChar());
  }

  static hexString(length: number): Generator<string> {
    return this.repeat(length, this.hexChar());
  }

  /*
   * Generate RFC 4122 compliant UUID
   */
  static uuid(): Generator<string> {
    const uuidVersion = 4;
    const variant = this.oneOfValues('8', '9', 'A', 'B');

    const blocks: Array<Generator<string>> = [
      this.hexString(8),
      this.hexString(4),
      this.hexString(3).map(_ => `${uuidVersion}${_}`),
      this.hexString(3).flatMap(_ => variant.map(v => `${v}${_}`)),
      this.hexString(12)
    ];
    return this.nTuple(...blocks).map(_ => _.join('-'));
  }

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

  static oneOfValues<T>(...values: Array<T>): Generator<T> {
    let generators = values.map(value => this.pure(value));
    return this.oneOf(...generators);
  }

  static sequenceOfValues<T>(...values: Array<T>): Generator<T> {
    let generators = values.map(value => this.pure(value));
    return this.sequenceOf(...generators);
  }

  static oneOf<T>(...generators: Array<Generator<T>>): Generator<T> {
    return new (class extends Generator<T> {

      generate() {
        let generated = none;
        if (generators.length > 0) {
          let randomIndex = Math.floor(Math.min(
            Math.random() * generators.length,
            generators.length - 1
          ));
          let randomGenerator = generators[randomIndex];
          generated = randomGenerator.generate();
        }
        return generated;
      }
    })();
  }

  static sequenceOf<T>(...values: Array<Generator<T>>): Generator<T> {
    return new (class extends Generator<T> {
      idx: number = -1;

      generate() {
        if (values.length > 0) {
          this.idx = (this.idx + 1) % values.length;
          return values[this.idx].generate();
        } else {
          return none;
        }
      }
    })();
  }

  static nTuple<T1, T2>(g1: G<T1>, g2: G<T2>): G<[T1, T2]>
  static nTuple<T1, T2, T3>(g1: G<T1>, g2: G<T2>, g3: G<T3>): G<[T1, T2, T3]>
  static nTuple<T1, T2, T3, T4>(g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>): G<[T1, T2, T3, T4]>
  static nTuple<T1, T2, T3, T4, T5>(g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>): G<[T1, T2, T3, T4, T5]>
  static nTuple<T1, T2, T3, T4, T5, T6>(g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>, g6: G<T6>): G<[T1, T2, T3, T4, T5, T6]>
  static nTuple<T1, T2, T3, T4, T5, T6, T7>(g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>, g6: G<T6>, g7: G<T7>): G<[T1, T2, T3, T4, T5, T6, T7]>
  static nTuple<T1, T2, T3, T4, T5, T6, T7, T8>(g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>, g6: G<T6>, g7: G<T7>, g8: G<T8>): G<[T1, T2, T3, T4, T5, T6, T7, T8]>
  static nTuple<T1, T2, T3, T4, T5, T6, T7, T8, T9>(g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>, g6: G<T6>, g7: G<T7>, g8: G<T8>, g9: G<T9>): G<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>
  static nTuple<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>, g6: G<T6>, g7: G<T7>, g8: G<T8>, g9: G<T9>, g10: G<T10>): G<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>
  //TODO: Add tests for this variant
  static nTuple<T>(...generators: Array<Generator<T>>): Generator<[T]>

  static nTuple(...generators: Array<Generator<any>>): Generator<any> {
    return this.objectGenerator((...generatedFields: any[]) => generatedFields, ...generators);
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
    return this.objectGenerator((...args: any[]) => new objectConstructor(...args), ...fieldGenerators);
  }

  private static objectGenerator<R>(objectFromArgs: (...args: any[]) => R, ...fieldGenerators: Array<Generator<any>>): Generator<R> {
    return new (class extends Generator<R> {
      generate(): Maybe<R> {
        let generatedFields = fieldGenerators.map(g => g.generate())
          .filter(v => v.isDefined).map(v => v.value);

        if (generatedFields.length < fieldGenerators.length) {
          return none;
        } else {
          return new Some(objectFromArgs(...generatedFields));
        }
      }
    });
  }
};
