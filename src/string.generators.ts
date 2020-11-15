import { Generator } from './generator';
import * as Generators from './generators';

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
    .map(charCode => String.fromCharCode(charCode))
}

export function alphaChar(): Generator<string> {
  return Generators.oneOf(this.alphaLowerChar(), this.alphaUpperChar());
}

export function alphaLowerChar(): Generator<string> {
  return this.asciiRange(lettersASCIIStart, lettersASCIIEnd);
}

export function alphaUpperChar(): Generator<string> {
  return this.asciiRange(capitalLettersASCIIStart, capitalLettersASCIIEnd);
}

export function hexChar(): Generator<string> {
  return Generators.oneOf(
    this.numChar(),
    this.asciiRange(
      asciiCode('A'),
      asciiCode('F')
    )
  );
}

export function concat(...generators: Array<Generator<string>>): Generator<string> {
  return Generators.nTuple(...generators).map(values => values.join(''));
}

export function numChar(): Generator<string> {
  return this.asciiRange(digitsASCIIStart, digitsASCIIEnd);
}

export function alphaNumChar(): Generator<string> {
  return Generators.oneOf(this.alphaChar(), this.numChar());
}

export function alphaNumString(length: number): Generator<string> {
  return Generators.repeat(length, this.alphaNumChar());
}

export function hexString(length: number): Generator<string> {
  return Generators.repeat(length, this.hexChar());
}

export function identifier(maxLength: number): Generator<string> {
  //TODO: Implement
  return null;
}

/*
 * Generate RFC 4122 compliant UUID
 */
export function uuid(): Generator<string> {
  const uuidVersion = 4;
  const variant = Generators.oneOfValues('8', '9', 'A', 'B');

  const blocks: Array<Generator<string>> = [
    this.hexString(8),
    this.hexString(4),
    this.hexString(3).map(_ => `${uuidVersion}${_}`),
    this.hexString(3).flatMap(_ => variant.map(v => `${v}${_}`)),
    this.hexString(12)
  ];
  return Generators.nTuple(...blocks).map(_ => _.join('-'));
}