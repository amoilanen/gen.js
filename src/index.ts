import { Maybe, none } from './maybe';

function forAll<T>(gen: Generator<T>, predicate: (x: T) => Boolean) {
  //TODO: Implement
}

function exists<T>(gen: Generator<T>, predicate: (x: T) => Boolean) {
  //TODO: Implement
}

export abstract class Generator<T> {

  abstract generate(): Maybe<T>
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
};

let value = Generators.choose(0, 10).generate();

console.log(value);

let x: Maybe<number> = Maybe.from(2);
console.log(x.isDefined);
console.log(x.value);

let y: Maybe<number> = Maybe.from<number>(null);
console.log(y.isDefined);
//console.log(y.value);