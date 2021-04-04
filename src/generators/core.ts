import { Maybe, Some, none } from '../maybe';
import { Lazy } from '../lazy';
import { Generator } from '../generator';

const pure = Generator.pure;

const neverGenerator: Generator<any> = pure(null);

export function never<T>(): Generator<T> {
  return neverGenerator;
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

    private chooseRandomGenerator(): Maybe<Generator<T>> {
      const length = generators.length;
      if (length > 0) {
        let randomIndex = Math.floor(Math.min(
          Math.random() * length,
          length - 1
        ));
        let randomGenerator = generators[randomIndex];
        return new Some(randomGenerator);
      } else {
        return none;
      }
    }

    generate() {
      return this.chooseRandomGenerator().flatMap(g => g.generate());
    }
  })();
}

export function sequenceOf<T>(...values: Array<Generator<T>>): Generator<T> {
  return new (class extends Generator<T> {
    idx: number = -1;

    private nextGenerator(): Maybe<Generator<T>> {
      if (values.length > 0) {
        this.idx = (this.idx + 1) % values.length;
        return new Some(values[this.idx]);
      } else {
        return none;
      }
    }

    generate() {
      return this.nextGenerator().flatMap(g => g.generate());
    }
  })();
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
  generatorFrequences = generatorFrequences.filter(([frequency, _]) => frequency > 0);
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

export function recursive<T>(block: (recurse: Lazy<Generator<T>>) => Generator<T>): Generator<T> {
  return block(new Lazy(() => recursive(block)));
}