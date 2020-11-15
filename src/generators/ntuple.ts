import { Generator } from '../generator';
import { objectGenerator } from './object';

type G<T> = Generator<T>;

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