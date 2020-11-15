import { expect } from 'chai';

import * as Generators from '../src/generators';

const pure = Generators.pure;

describe('Generator', () => {

  describe('map', () => {

    it('should produce new Generator', () => {
      let value = 5;
      let g = Generators.choose(value, value);

      expect(g.map(x => x * x).generate().get()).to.eql(value * value);
    });
  });

  describe('flatMap', () => {

    it('should produce new Generator', () => {
      let value = 'x';
      let g = Generators.pure(value);

      expect(g.flatMap(x => Generators.pure(x + x)).generate().get()).to.eql(value + value);
    });
  });

  describe('Monadic laws for Generator', () => {

    let valuesNumber = 10;
    let valueGenerator = Generators.choose(1, valuesNumber * valuesNumber);
    let values = [...Array(valuesNumber).keys()]
      .map(_ => valueGenerator.generate()).filter(x => x.isDefined).map(x => x.get())

    // flatMap(f)(pure) == f
    it('should satisfy the left identity law', () => {
      values.forEach(value => {
        let f = (x: number) => pure(2 * x);
        expect(pure(value).flatMap(f).generate()).to.eql(f(value).generate());
      });
    });

    // m.flatMap(pure) == m
    it('should satisfy the right identity law', () => {
      values.forEach(value => {
        let m = pure(value)
        expect(m.flatMap(pure).generate()).to.eql(m.generate());
      });
    });

    // m.flatMap(f).flatMap(g) == m.flatMap(flatMap(g)(f))
    it('should satisfy the associativity law', () => {
      values.forEach(value => {
        let f = (x: number) => pure(2 * x);
        let g = (x: number) => pure(x * x);
        let m = pure(value);

        let leftSide = m.flatMap(f).flatMap(g);
        let rightSide = m.flatMap(x => f(x).flatMap(g));
  
        expect(leftSide.generate()).to.eql(rightSide.generate());
      });
    });
  });
});