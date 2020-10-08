import { expect } from 'chai';
import { stub } from 'sinon';

import { Maybe, Some, none } from '../src/maybe';
import { Generators, Generator } from '../src';

describe('Generators', () => {

  describe('choose', () => {

    it('should produce empty value for empty range', () => {
      let generator: Generator<number> = Generators.choose(1, 0);

      expect(generator.generate()).to.eql(none);
    });

    it('should produce single point for the range containing one point', () => {
      let generator: Generator<number> = Generators.choose(5, 5);

      expect(generator.generate()).to.eql(Maybe.pure(5));
    });

    it('should produce a random value within a range', () => {
      stub(Math, 'random').returns(0.5);
      let generator: Generator<number> = Generators.choose(0, 10);

      expect(generator.generate()).to.eql(Maybe.pure(5));
    });
  });

  describe('never', () => {

    it('should always produce empty value', () => {
      let generator: Generator<number> = Generators.never();

      expect(generator.generate()).to.eql(none);
    });
  });

  describe('pure', () => {

    it('should produce the value given as the argument', () => {
      let value = 5;

      expect(Generators.pure(value).generate()).to.eql(new Some(value));
    });
  });

  describe('oneOfValues', () => {

    it('should generate one of the values', () => {
      let values = [1, 2, 3];
      let generatedValue = Generators.oneOfValues(...values).generate();
      expect(values.includes(generatedValue.get())).to.be.true;
    });

    it('should generate none when the list of values is empty', () => {
      expect(Generators.oneOfValues().generate()).to.eql(none);
    });
  });

  describe('oneOf', () => {

    it('should generate one of the values', () => {
      let first = Generators.choose(0, 10);
      let second = Generators.choose(10, 20);
      let third = Generators.choose(20, 30);
      let generatedValue = Generators.oneOf(first, second, third).generate().get();
      expect(generatedValue).within(0, 30);
    });

    it('should generate none when the list of values is empty', () => {
      expect(Generators.oneOf().generate()).to.eql(none);
    });
  });

  describe('nTuple', () => {

    const g1 = Generators.pure(1);
    const g2 = Generators.pure(2);
    const g3 = Generators.pure(3);
    const empty = Generators.never();

    it('should generate value if all the used generators generate values', () => {
      expect(Generators.nTuple(g1, g2, g3).generate().get()).to.eql([1, 2, 3]);
    });

    it('should generate none when one of the used generated generators generates none', () => {
      expect(Generators.nTuple(g1, empty, g2).generate()).to.eql(none);
    });

    it('should generate none when all of the used generated generators generate none', () => {
      expect(Generators.nTuple(empty, empty, empty).generate()).to.eql(none);
    });
  });
});