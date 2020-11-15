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
});