import { Maybe, none } from '../maybe';
import { Generator } from '../generator';

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