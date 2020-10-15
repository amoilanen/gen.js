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

  describe('object', () => {

    class City {
      constructor(
        readonly name: string,
        readonly population: number,
        readonly area: number) {}
    }

    const name = 'name1';
    const nameGenerator = Generators.pure(name);
    const population = 123;
    const populationGenerator = Generators.pure(population);
    const area = 10;
    const areaGenerator = Generators.pure(area);
    const empty = Generators.never();

    it('should generate value if all the used generators generate values', () => {
      const expected = new City(name, population, area);
      expect(Generators.object(City, nameGenerator, populationGenerator, areaGenerator).generate().get()).to.eql(expected);
    });

    it('should generate none when one of the used generated generators generates none', () => {
      expect(Generators.object(City, nameGenerator, empty, areaGenerator).generate()).to.eql(none);
    });

    it('should generate none when all of the used generated generators generate none', () => {
      expect(Generators.nTuple(empty, empty, empty).generate()).to.eql(none);
    });
  });

  describe('times', () => {

    const value = 'a';

    it('should generate array of the requested length', () => {
      const elementsNumber = 5;
      const generator = Generators.times(elementsNumber, Generators.pure(value));

      const expected = [...new Array(elementsNumber)].map(_ => value);
      expect(generator.generate().get()).to.eql(expected);
    });

    it('should be able to generate array of length 1', () => {
      const triesNumber = 10;
      const generator = Generators.pure(value);
      const timesGenerator = Generators.times(1, generator);
      const arrayGenerator = generator.map(value => [ value ]);
      [...Array(triesNumber)].forEach(_ => {
        expect(timesGenerator.generate()).to.eql(arrayGenerator.generate());
      });
    });

    it('should always generate an empty Array if timesNumber is 0', () => {
      const generator = Generators.times(0, Generators.never());
      expect(generator.generate().get()).to.eql([]);
    });

    it('should always generate an empty Array if timesNumber is negative', () => {
      const generator = Generators.times(-3, Generators.never());
      expect(generator.generate().get()).to.eql([]);
    });
  });

  describe('concat', () => {

    it('should produce a string by concatenating the values generated by the given Generator', () => {

    });

    it('should produce empty string if times is negative or 0', () => {

    });

    it('should produce None if provided Generator generates None at least once', ()  => {

    });
  });

  describeStringGenerator('asciiRange', Generators.asciiRange(40, 41), /[\(\)]/);
  describeStringGenerator('alphaLowerChar', Generators.alphaLowerChar(), /[a-z]/);
  describeStringGenerator('alphaUpperChar', Generators.alphaUpperChar(), /[A-Z]/);
  describeStringGenerator('alphaChar', Generators.alphaChar(), /[a-zA-Z]/);
  describeStringGenerator('numChar', Generators.numChar(), /[0-9]/);
  describeStringGenerator('alphaNumChar', Generators.alphaNumChar(), /[0-9a-zA-Z]/);
  describeStringGenerator('hexChar', Generators.hexChar(), /[0-9A-F]/);
  describeStringGenerator('uuid', Generators.uuid(), /[0-9A-F]{8}\-[0-9A-F]{4}\-4[0-9A-F]{3}\-[89AB][0-9A-F]{3}\-[0-9A-F]{12}/); // RFC 4122 compliant UUID

  function describeStringGenerator(generatorName: string, generator: Generator<string>, expectedRegex: RegExp) {
    describe(generatorName, () => {
      const triesNumber = 10;

      const generatedCharacters = [...Array(triesNumber)].map(_ =>
        generator.generate()
      );
  
      it(`should generate characters in the range ${expectedRegex}`, () => {
        expect(generatedCharacters.every(char => char.isDefined)).to.be.true;
        expect(generatedCharacters.every(char => expectedRegex.test(char.get()))).to.be.true;
      });
  
      it('should generate different characters', () => {
        const uniqueGeneratedCharacters = new Set(generatedCharacters);
        expect(uniqueGeneratedCharacters.size).to.be.above(1);
      });
    });
  }
});