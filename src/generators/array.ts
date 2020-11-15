import { Generator } from '../generator';
import { nTuple } from './ntuple';
import { never } from './core';
import { choose } from './number';


export function times<T>(timesNumber: number, generator: Generator<T>): Generator<Array<T>> {
  timesNumber = Math.max(timesNumber, 0);
  const generators = [...Array(timesNumber)].map(_ => generator);
  return nTuple(...generators);
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