import { Maybe, Some, none } from './maybe';
import { Generator } from './generator';

export * from './string.generators';

type G<T> = Generator<T>;

export function times<T>(timesNumber: number, generator: Generator<T>): Generator<Array<T>> {
  timesNumber = Math.max(timesNumber, 0);
  const generators = [...Array(timesNumber)].map(_ => generator);
  return nTuple(...generators);
}

export function repeat(numberOfTimes: number, stringGenerator: Generator<string>): Generator<string> {
  return times(numberOfTimes, stringGenerator).map(_ => _.join(''));
}

export function choose(min: number, max: number): Generator<number> {
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

export function never<T>(): Generator<T> {
  return new (class extends Generator<T> {
    generate() {
      return none;
    }
  });
}

export function pure<T>(value: T): Generator<T> {
  let generatedValue = new Some(value);
  return new (class extends Generator<T> {

    generate() {
      return generatedValue;
    }
  })();
}

export function oneOfValues<T>(...values: Array<T>): Generator<T> {
  let generators = values.map(value => pure(value));
  return oneOf(...generators);
}

export function sequenceOfValues<T>(...values: Array<T>): Generator<T> {
  let generators = values.map(value => pure(value));
  return sequenceOf(...generators);
}

export function oneOf<T>(...generators: Array<Generator<T>>): Generator<T> {
  return new (class extends Generator<T> {

    generate() {
      let generated = none;
      const length = generators.length;
      if (length > 0) {
        let randomIndex = Math.floor(Math.min(
          Math.random() * length,
          length - 1
        ));
        let randomGenerator = generators[randomIndex];
        generated = randomGenerator.generate();
      }
      return generated;
    }
  })();
}

export function sequenceOf<T>(...values: Array<Generator<T>>): Generator<T> {
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

export function nonEmptyArray<T>(generator: Generator<T>, maxSize: number): Generator<Array<T>> {
  //TODO: Test
  let suffixGenerator = arrayOfLength(generator, maxSize - 1);
  return nTuple(generator, suffixGenerator).map(([first, suffix]: [T, Array<T>]) =>
    [first].concat(suffix)
  );
}

export function arrayOfLength<T>(generator: Generator<T>, length: number): Generator<Array<T>> {
  return (length < 0) ?
    never()
    : nTuple(...[...Array(length)].map(_ => generator));
}

export function arrayOf<T>(generator: Generator<T>, maxLength: number): Generator<Array<T>> {
  return choose(0, maxLength).flatMap(length =>
    arrayOfLength(generator, Math.round(length))
  );
}

export function frequencyOfValues<T>(...valueFrequencies: Array<[number, T]>): Generator<T> {
  const generators: Array<[number, Generator<T>]> = valueFrequencies.map(([frequency, value]) =>
    [frequency, pure(value)]);
  return frequency(...generators);
}

function frequenciesToProbabilities(frequencies: Array<number>): Array<number> {
  const totalFrequency = frequencies.reduce((x, y) => x + y);
  return frequencies.map(_ => _ / totalFrequency);
}

function randomIndexWithProbabilityDistribution(probabilities: Array<number>): number {
  const randomValue = Math.random();
  let currentIndex = 0;
  let hasFoundIndex = false;
  let accumulatedProbability = 0;
  while (!hasFoundIndex && (currentIndex < probabilities.length)) {
    accumulatedProbability += probabilities[currentIndex];
    currentIndex += 1;
    if (accumulatedProbability >= randomValue) {
      hasFoundIndex = true;
    }
  }
  return currentIndex - 1;
}

export function frequency<T>(...generatorFrequences: Array<[number, Generator<T>]>): Generator<T> {
  generatorFrequences = generatorFrequences.filter(frequency => frequency[0] > 0);
  if (generatorFrequences.length > 0) {
    const frequencies = generatorFrequences.map(([frequency, _]) => frequency);
    const generators = generatorFrequences.map(([_, generator]) => generator);
    const probabilities = frequenciesToProbabilities(frequencies);

    return new (class extends Generator<T> {

      generate() {
        let generatorIdx = randomIndexWithProbabilityDistribution(probabilities);
        if (generatorIdx >= 0) {
          return generators[generatorIdx].generate();
        } else {
          return none;
        }
      }
    })();
  } else {
    return never();
  }
}

export function nTuple<T1, T2>(g1: G<T1>, g2: G<T2>): G<[T1, T2]>
export function nTuple<T1, T2, T3>(g1: G<T1>, g2: G<T2>, g3: G<T3>): G<[T1, T2, T3]>
export function nTuple<T1, T2, T3, T4>(g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>): G<[T1, T2, T3, T4]>
export function nTuple<T1, T2, T3, T4, T5>(g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>): G<[T1, T2, T3, T4, T5]>
export function nTuple<T1, T2, T3, T4, T5, T6>(g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>, g6: G<T6>): G<[T1, T2, T3, T4, T5, T6]>
export function nTuple<T1, T2, T3, T4, T5, T6, T7>(g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>, g6: G<T6>, g7: G<T7>): G<[T1, T2, T3, T4, T5, T6, T7]>
export function nTuple<T1, T2, T3, T4, T5, T6, T7, T8>(g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>, g6: G<T6>, g7: G<T7>, g8: G<T8>): G<[T1, T2, T3, T4, T5, T6, T7, T8]>
export function nTuple<T1, T2, T3, T4, T5, T6, T7, T8, T9>(g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>, g6: G<T6>, g7: G<T7>, g8: G<T8>, g9: G<T9>): G<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>
export function nTuple<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>, g6: G<T6>, g7: G<T7>, g8: G<T8>, g9: G<T9>, g10: G<T10>): G<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>
//TODO: Add tests for this variant
export function nTuple<T>(...generators: Array<Generator<T>>): Generator<[T]>

export function nTuple(...generators: Array<Generator<any>>): Generator<any> {
  return objectGenerator((...generatedFields: any[]) => generatedFields, ...generators);
}

export function object<R>(objectConstructor: new () => R): G<R>
export function object<R, T1>(objectConstructor: new (x1: T1) => R, g1: G<T1>): G<R>
export function object<R, T1, T2>(objectConstructor: new (x1: T1, x2: T2) => R, g1: G<T1>, g2: G<T2>): G<R>
export function object<R, T1, T2, T3>(objectConstructor: new (x1: T1, x2: T2, x3: T3) => R, g1: G<T1>, g2: G<T2>, g3: G<T3>): G<R>
export function object<R, T1, T2, T3, T4>(objectConstructor: new (x1: T1, x2: T2, x3: T3, x4: T4) => R, g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>): G<R>
export function object<R, T1, T2, T3, T4, T5>(objectConstructor: new (x1: T1, x2: T2, x3: T3, x4: T4, x5: T5) => R,
  g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>): G<R>
export function object<R, T1, T2, T3, T4, T5, T6>(objectConstructor: new (x1: T1, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6) => R,
  g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>, g6: G<T6>): G<R>
export function object<R, T1, T2, T3, T4, T5, T6, T7>(objectConstructor: new (x1: T1, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6, x7: T7) => R,
  g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>, g6: G<T6>, g7: G<T7>): G<R>
export function object<R, T1, T2, T3, T4, T5, T6, T7, T8>(objectConstructor: new (x1: T1, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6, x7: T7, x8: T8) => R,
  g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>, g6: G<T6>, g7: G<T7>, g8: G<T8>): G<R>
export function object<R, T1, T2, T3, T4, T5, T6, T7, T8, T9>(objectConstructor: new (x1: T1, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6, x7: T7, x8: T8, x9: T9) => R,
  g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>, g6: G<T6>, g7: G<T7>, g8: G<T8>, g9: G<T9>): G<R>
export function object<R, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(objectConstructor: new (x1: T1, x2: T2, x3: T3, x4: T4, x5: T5, x6: T6, x7: T7, x8: T8, x9: T9, x10: T10) => R,
  g1: G<T1>, g2: G<T2>, g3: G<T3>, g4: G<T4>, g5: G<T5>, g6: G<T6>, g7: G<T7>, g8: G<T8>, g9: G<T9>, g10: G<T10>): G<R>

export function object<R>(objectConstructor: new (...args: any[]) => R, ...fieldGenerators: Array<Generator<any>>): Generator<R> {
  return objectGenerator((...args: any[]) => new objectConstructor(...args), ...fieldGenerators);
}

function objectGenerator<R>(objectFromArgs: (...args: any[]) => R, ...fieldGenerators: Array<Generator<any>>): Generator<R> {
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