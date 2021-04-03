import { expect } from 'chai';

import { none } from '../../src/maybe';
import { Generators } from '../../src';

describe('object generators', () => {

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
    const never = Generators.never;

    it('should generate value if all the used generators generate values', () => {
      const expected = new City(name, population, area);
      expect(Generators.object(City, nameGenerator, populationGenerator, areaGenerator).generate().get()).to.eql(expected);
    });

    it('should generate none when one of the used generated generators generates none', () => {
      expect(Generators.object(City, nameGenerator, never<number>(), areaGenerator).generate()).to.eql(none);
    });

    it('should generate none when all of the used generated generators generate none', () => {
      expect(Generators.object(City, never<string>(), never<number>(), never<number>()).generate()).to.eql(none);
    });
  });
});