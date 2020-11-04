import { expect } from 'chai';
import { SinonSandbox, createSandbox, stub} from 'sinon';

import { Maybe, Some, none } from '../src/maybe';
import { Generators, Generator } from '../src';

describe('Generators', () => {

  let sandbox: SinonSandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

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
      sandbox.stub(Math, 'random').returns(0.5);
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
      const value = "abcde";
      const charGenerators = value.split("").map(char => Generators.pure(char));
      expect(Generators.concat(...charGenerators).generate().value).to.eql(value);
    });

    it('should produce the same generator if only one generator is given', () => {
      const generator = Generators.pure('a');
      expect(Generators.concat(generator).generate()).to.eql(generator.generate());
    });

    it('should produce empty string when no generators given', () => {
      expect(Generators.concat().generate().value).to.eql('');
    });
  });

  describe('repeat', () => {

    it('should produce a string by concatenating the values generated by the given Generator', () => {
      const value = 'a';
      const generator = Generators.pure(value);
      const times = 10;

      const expectedValue =   [...Array(times)].map(_ => value).join('');

      expect(Generators.repeat(times, generator).generate().value).to.eql(expectedValue);
    });

    it('should produce empty string if repeat is negative or 0', () => {
      const value = 'a';
      const generator = Generators.pure(value);
      expect(Generators.repeat(0, generator).generate().value).to.eql('');
      expect(Generators.repeat(-1, generator).generate().value).to.eql('');
    });

    it('should produce None if provided Generator generates None at least once', ()  => {
      const generator = Generators.sequenceOf(Generators.pure('a'), Generators.pure('b'), Generators.never());

      expect(Generators.repeat(3, generator).generate()).to.eql(none);
    });
  });

  describe('sequenceOfValues', () => {

    it('should generate the given values in sequence', () => {
      const values = [0, 1, 2];
      const generator = Generators.sequenceOfValues(...values);
      const numberOfSequences = 3;
      const times = values.length * numberOfSequences;

      const expected = [].concat.apply([], [...Array(numberOfSequences)].map(_ => values));
      const generated = [...Array(times)].map(_ =>
        generator.generate().get()
      );
      expect(generated).to.eql(expected);
    });

    it('should generate only single value if a single value is given', () => {
      const value = 3;
      const times = 5;
      const expected = [...Array(times)].map(_ => value);
      const generator = Generators.sequenceOfValues(value);

      const generated = [...Array(times)].map(_ =>
        generator.generate().get()
      );
      expect(generated).to.eql(expected);
    });


    it('should generate none if no values are given', () => {
      expect(Generators.sequenceOfValues().generate()).to.eql(none);
    });
  });

  describe('sequenceOf', () => {

    it('should generate sequence of values generated by the generators', () => {
      const generators = [Generators.pure(1), Generators.never(), Generators.pure(2)];
      const sequenceGenerator = Generators.sequenceOf(...generators);

      const generated = generators.map(_ => sequenceGenerator.generate());

      expect(generated).to.eql([new Some(1), none, new Some(2)]);
    });

    it('should generate a single value if only one generator is provided', () => {
      const value = 3;
      const generator = Generators.sequenceOf(Generators.pure(value));
      expect(generator.generate().get()).to.eql(value);
    });

    it('should generate none if no generators are provided', () => {
      const generator = Generators.sequenceOf();
      expect(generator.generate()).to.eql(none);
    });
  });

  describe('frequency', () => {

    it('should choose one of two generators based on frequency which is different', () => {
      const firstValueFrequency = 0.1
      const firstValue = 1
      const secondValueFrequency = 0.9
      const secondValue = 2
      const smallDelta = Math.min(firstValueFrequency, secondValueFrequency) / 2;
      const generator = Generators.frequency([firstValueFrequency, Generators.pure(1)], [secondValueFrequency, Generators.pure(2)]);

      const stub = sandbox.stub(Math, 'random');
      stub.returns(firstValueFrequency - smallDelta);
      expect(generator.generate().get()).to.eql(firstValue);
      stub.returns(firstValueFrequency + smallDelta);
      expect(generator.generate().get()).to.eql(secondValue);
    });

    it('should support multiple generators and frequencies which do not add up to one', () => {
      const generatorsNumber = 5;
      const generatorFrequency = 3;
      const generators: Array<[number, Generator<number>]> = [...Array(generatorsNumber).keys()].map(idx =>
        [generatorFrequency, Generators.pure(idx)]
      );

      const generator = Generators.frequency(...generators);
      const lastGeneratorProbability = 1 - (1 / (generatorsNumber + 1));
      sandbox.stub(Math, 'random').returns(lastGeneratorProbability);
      expect(generator.generate().get()).to.eql(generatorsNumber - 1);
    });

    it('should result in the provided generator if only one is given', () => {
      const value = 5;
      expect(Generators.frequency([1, Generators.pure(value)]).generate().get()).to.eql(value);
    });

    it('should generate none if no generators are provided', () => {
      expect(Generators.frequency().generate()).to.eql(none);
    });


    it('should generate none if all generator frequencies are zero', () => {
      const generatorsNumber = 3;
      const generators: Array<[number, Generator<number>]> = [...Array(generatorsNumber).keys()].map(idx =>
        [0, Generators.pure(idx)]
      );

      const generator = Generators.frequency(...generators);
      sandbox.stub(Math, 'random').returns(0.5);
      expect(generator.generate()).to.eql(none);
    });

    it('should interpret negative frequencies as zero', () => {
      const generator = Generators.frequency([0, Generators.pure(1)], [0.2, Generators.pure(2)]);

      expect(generator.generate().get()).to.eql(2);
    });
  });

  describe('frequencyOfValues', () => {

    it('should generate given values with the provided frequencies', () => {
      const generator = Generators.frequencyOfValues([0.3, 1], [0.3, 2], [0.4, 3]);
      sandbox.stub(Math, 'random').returns(0.5);
      expect(generator.generate().get()).to.eql(2);
    });
  });

  describe('arrayOfLength', () => {

    it('should generate array of given length if generator generates values', () => {
      const value = 'abc';
      const length = 5;
      const generator = Generators.arrayOfLength(Generators.pure(value), length);
      const expected = [...Array(length)].map(_ => value);
      expect(generator.generate().get()).to.eql(expected);
    });

    it('should generate none if given generator generates none at least once', () => {
      const value = 3;
      const frequencyGenerator = Generators.frequency([0.1, Generators.pure(value)], [0.9, Generators.never()]);
      const random = sandbox.stub(Math, 'random')
      random.onCall(0).returns(0.05);
      random.onCall(1).returns(0.06);
      random.onCall(2).returns(0.15);
      const generator = Generators.arrayOfLength(frequencyGenerator, 3);
      expect(generator.generate()).to.eql(none);
    });

    it('should generate empty array if length is zero', () => {
      let notNoneZeroTimes = Generators.arrayOfLength(Generators.pure(3), 0);
      let noneZeroTimes = Generators.arrayOfLength(Generators.never(), 0);

      expect(notNoneZeroTimes.generate().get()).to.eql([]);
      expect(noneZeroTimes.generate().get()).to.eql([]);
    });

    it('should generate none if the length is negative', () => {
      let generator = Generators.arrayOfLength(Generators.pure(3), -5);

      expect(generator.generate()).to.eql(none);
    });
  });

  describe('arrayOf', () => {

    const value = 3;
    const maxLength = 10;

    it('should generate the array of at most provided length', () => {
      let valuesCount = 5;
      expect(valuesCount).to.be.lessThan(maxLength);

      let generator = Generators.arrayOf(Generators.pure(value), maxLength);

      let smallDelta = 1 / (maxLength * 10);
      sandbox.stub(Math, 'random').returns((valuesCount / maxLength) + smallDelta);
      expect(generator.generate().get()).to.eql([...Array(valuesCount)].map( _ => value));
    });

    it('might generate arrays of different lengths on subsequent tries', () => {
      let generator = Generators.arrayOf(Generators.pure(value), maxLength);

      const random = sandbox.stub(Math, 'random')
      random.onCall(0).returns(0.11);
      random.onCall(1).returns(0.21);
      random.onCall(2).returns(0.31);

      expect(generator.generate().get()).to.eql([ value ]);
      expect(generator.generate().get()).to.eql([ value, value ]);
      expect(generator.generate().get()).to.eql([ value, value, value ]);
    });

    it('should generate empty array if length is zero', () => {
      let notNoneZeroTimes = Generators.arrayOf(Generators.pure(3), 0);
      let noneZeroTimes = Generators.arrayOf(Generators.never(), 0);

      expect(notNoneZeroTimes.generate().get()).to.eql([]);
      expect(noneZeroTimes.generate().get()).to.eql([]);
    });

    it('should generate none if the length is negative', () => {
      let generator = Generators.arrayOf(Generators.pure(3), -5);

      expect(generator.generate()).to.eql(none);
    });
  });

  describe('alphaNumString', () => {
    describeStringGenerator('alphaNumString - fixed length', Generators.alphaNumString(3), /[a-zA-Z0-9]{3}/);
    describeStringGenerator('alphaNumString - one symbol', Generators.alphaNumString(1), /[a-zA-Z0-9]/);
    describeStringGenerator('alphaNumString - empty string', Generators.alphaNumString(0), /.{0}/);
  });

  describe('hexString', () => {
    describeStringGenerator('hexString - fixed length', Generators.hexString(3), /[0-9A-F]{3}/);
    describeStringGenerator('hexString - one symbol', Generators.hexString(1), /[0-9A-F]/);
    describeStringGenerator('hexString - empty string', Generators.hexString(0), /.{0}/);
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
  
      it(`should generate strings matching ${expectedRegex}`, () => {
        expect(generatedCharacters.every(char => char.isDefined)).to.be.true;
        expect(generatedCharacters.every(char => expectedRegex.test(char.get()))).to.be.true;
      });
  
      it('should generate different strings', () => {
        const uniqueGeneratedCharacters = new Set(generatedCharacters);
        expect(uniqueGeneratedCharacters.size).to.be.above(1);
      });
    });
  }
});