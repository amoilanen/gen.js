import { expect } from 'chai';

import { Maybe, Some, None, none } from '../src/maybe';

describe('Maybe', () => {

  describe('from', () => {

    it('should produce Some for a non-empty value', () => {
      let numericValue = 3;
      let wrappedValue: Maybe<number> = Maybe.from(numericValue);

      expect(wrappedValue).to.eql(new Some(numericValue));
    });

    it('should produce None for an empty value', () => {
      let wrappedValue: Maybe<number> = Maybe.from(null);

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

  //TODO: Verify monadic laws
});