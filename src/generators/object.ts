import { Generator } from '../generator';
import { Maybe, Some, none } from '../maybe';

type G<T> = Generator<T>;

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

export function objectGenerator<R>(objectFromArgs: (...args: any[]) => R, ...fieldGenerators: Array<Generator<any>>): Generator<R> {
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