import { expect } from 'chai';

import { Generators } from '../src/generator';
import { Maybe, Some, none } from '../src/maybe';

const pure = Maybe.pure;

describe('Maybe', () => {

  describe('pure', () => {

    it('should produce Some for a non-empty value', () => {
      let numericValue = 3;
      let wrappedValue: Maybe<number> = pure(numericValue);

      expect(wrappedValue).to.eql(new Some(numericValue));
    });

    it('should produce None for an empty value', () => {
      let wrappedValue: Maybe<number> = pure(null);

      expect(wrappedValue).to.equal(none);
    });
  });

  describe('Some', () => {

    let value = 2;

    it('should be defined and have value', () => {
      let wrappedValue = new Some(value);
      expect(wrappedValue.isDefined).to.be.true;
      expect(wrappedValue.value).to.eql(value)
    });

    it('should map to another Some', () => {
      let wrappedValue = new Some(value).map( x => 2 * x);
      expect(wrappedValue).to.eql(new Some(2 * value));
    });

    it('should flatMap to another Some', () => {
      let wrappedValue = new Some(value).flatMap( x => new Some(x - 1));
      expect(wrappedValue).to.eql(new Some(value - 1));
    });
  });

  describe('None', () => {

    it('should not be defined and value should throw exception', () => {
      expect(none.isDefined).to.be.false;
      expect(() => none.value).to.throw('None: accessing undefined value');
    });

    it('should map to None', () => {
      expect(none.map(x => 2 * x)).to.equal(none);
    });

    it('should flatMap to None', () => {
      expect(none.flatMap(x => new Some(2 * x))).to.equal(none);
    });
  });

  describe('Monadic laws for Maybe', () => {

    let values = [null, 1, 3, 5];

    // flatMap(f)(pure) == f
    it('should satisfy the left identity law', () => {
      values.forEach(value => {
        let f = (x: number) => pure(x == null ? null : 2 * x);
        let leftSide = pure(value).flatMap(f);
        let rightSide = f(value);
        expect(pure(value).flatMap(f)).to.eql(f(value));
      });
    });

    // m.flatMap(pure) == m
    it('should satisfy the right identity law', () => {
      values.forEach(value => {
        let m = pure(value)
        expect(m.flatMap(pure)).to.eql(m);
      });
    });

    // m.flatMap(f).flatMap(g) == m.flatMap(flatMap(g)(f))
    it('should satisfy the associativity law', () => {
      values.forEach(value => {
        let f = (x: number) => pure(x == null ? null : 2 * x);
        let g = (x: number) => pure(x == null ? null : x * x);
        let m = pure(value);

        let leftSide = m.flatMap(f).flatMap(g);
        let rightSide = m.flatMap(x => f(x).flatMap(g));
  
        expect(leftSide).to.eql(rightSide);
      });
    });
  });
});