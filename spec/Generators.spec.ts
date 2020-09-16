import { expect } from 'chai';

import { Maybe, none, Some } from '../src/maybe';
import { Generators, Generator } from '../src';

describe('Generators', () => {

    describe('choose', () => {

      it('should produce empty value for empty range', () => {
        let generator: Generator<number> = Generators.choose(1, 0);

        expect(generator.generate()).to.eql(none);
      });

      it('should produce single point for the range containing one point', () => {
        let generator: Generator<number> = Generators.choose(5, 5);

        expect(generator.generate()).to.eql(Maybe.from(5));
      });

      it('should produce a random value within a range', () => {
        //TODO: Use sinon.js
        let originalMathRandom = Math.random;
        Math.random = () => 0.5;
        let generator: Generator<number> = Generators.choose(0, 10);

        expect(generator.generate()).to.eql(Maybe.from(5));

        Math.random = originalMathRandom;
      });
    });
});