import { expect } from 'chai';

import { none } from '../../src/maybe';
import { Generators } from '../../src';

describe('ntuple generators', () => {

  describe('nTuple', () => {

    const empty = Generators.never<number>();
    const g1 = Generators.pure(1);
    const g2 = Generators.pure(2);
    const g3 = Generators.pure(3);

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