export abstract class Maybe<T> {
  abstract isDefined: boolean
  abstract value: T
  abstract map<U>(f: (value: T) => U): Maybe<U>
  abstract flatMap<U>(f: (value: T) => Maybe<U>): Maybe<U>
  static from<U>(value: U): Maybe<U> {
    if (value !== undefined && value !== null) {
      return new Some(value);
    } else {
      return none;
    }
  }
}

export class Some<T> extends Maybe<T> {
  constructor(readonly value: T) {
    super();
  }
  isDefined = true
  map<U>(f: (value: T) => U): Maybe<U> {
    return new Some(f(this.value));
  }
  flatMap<U>(f: (value: T) => Maybe<U>): Maybe<U> {
    return f(this.value);
  }
}

export class None<T> extends Maybe<T> {
  constructor() {
    super();
  }
  get value(): T {
    throw new Error('None: accessing undefined value');
  }
  isDefined = false
  map<U>(f: (value: T) => U): Maybe<U> {
    return none;
  }
  flatMap<U>(f: (value: T) => Maybe<U>): Maybe<U> {
    return none;
  }
};

export const none: Maybe<any> = new None();