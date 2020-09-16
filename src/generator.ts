import { Maybe, None, Some, none } from './maybe';

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

  static never<T>(): Generator<T> {
    return new (class extends Generator<T> {
      generate() {
        return none;
      }
    });
  }
};
