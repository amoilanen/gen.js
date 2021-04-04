import { Some, none } from '../maybe';
import { Generator } from '../generator';

export function choose(min: number, max: number): Generator<number> {
  return new (class extends Generator<number> {
    generate() {
      if (max < min) {
        return none;
      } else {
        return new Some<number>(Math.random() * (max - min) + min);
      }
    }
  });
}