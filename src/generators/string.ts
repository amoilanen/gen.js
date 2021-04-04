import { Generator } from '../generator';
import * as Generators from '.';

export function asciiCode(char: string): number {
  return char.codePointAt(0);
}

const capitalLettersASCIIStart = asciiCode('A');
const capitalLettersASCIIEnd = asciiCode('Z');

const lettersASCIIStart = asciiCode('a');
const lettersASCIIEnd = asciiCode('z');

const digitsASCIIStart = asciiCode('0');
const digitsASCIIEnd = asciiCode('9');

export function asciiRange(from: number, to: number): Generator<string> {
  return Generators.choose(from, to)
    .map(value => String.fromCharCode(Math.ceil(value)))
}

export function alphaChar(): Generator<string> {
  return Generators.oneOf(alphaLowerChar(), alphaUpperChar());
}

export function alphaLowerChar(): Generator<string> {
  return asciiRange(lettersASCIIStart, lettersASCIIEnd);
}

export function alphaUpperChar(): Generator<string> {
  return asciiRange(capitalLettersASCIIStart, capitalLettersASCIIEnd);
}

export function hexChar(): Generator<string> {
  return Generators.oneOf(
    numChar(),
    asciiRange(
      asciiCode('A'),
      asciiCode('F')
    )
  );
}

export function repeat(numberOfTimes: number, stringGenerator: Generator<string>): Generator<string> {
  return Generators.times(numberOfTimes, stringGenerator).map(_ => _.join(''));
}

export function concat(...generators: Array<Generator<string>>): Generator<string> {
  return Generators.nTuple(...generators).map(values => values.join(''));
}

export function numChar(): Generator<string> {
  return asciiRange(digitsASCIIStart, digitsASCIIEnd);
}

export function alphaNumChar(): Generator<string> {
  return Generators.oneOf(alphaChar(), numChar());
}

export function alphaNumString(length: number): Generator<string> {
  return repeat(length, alphaNumChar());
}

export function hexString(length: number): Generator<string> {
  return repeat(length, hexChar());
}

export function identifier(maxLength: number): Generator<string> {
  return Generators.choose(1, maxLength)
    .map(len => Math.ceil(len))
    .flatMap(identifierLength =>
      alphaNumString(identifierLength - 1).flatMap(suffix =>
        alphaLowerChar().map(prefix => prefix + suffix)
      )
    );
}

/*
 * Generate RFC 4122 compliant UUID
 */
export function uuid(): Generator<string> {
  const uuidVersion = 4;
  const variant = Generators.oneOfValues('8', '9', 'A', 'B');

  const blocks: Array<Generator<string>> = [
    hexString(8),
    hexString(4),
    hexString(3).map(_ => `${uuidVersion}${_}`),
    hexString(3).flatMap(_ => variant.map(v => `${v}${_}`)),
    hexString(12)
  ];
  return Generators.nTuple(...blocks).map(_ => _.join('-'));
}