export interface Maybe<T> {
  isDefined: boolean;
  value: T;
  map<U>(f: (value: T) => U): Maybe<U>;
  flatMap<U>(f: (value: T) => Maybe<U>): Maybe<U>;
  get(): T;
}

export const Maybe = {
  pure: function<U>(value: U): Maybe<U> {
    if (value !== undefined && value !== null) {
      return new Some(value);
    } else {
      return none;
    }
  }
}

export class Some<T> implements Maybe<T> {
  constructor(readonly value: T) {
  }
  isDefined = true
  get(): T {
    return this.value;
  }
  map<U>(f: (value: T) => U): Maybe<U> {
    return new Some(f(this.value));
  }
  flatMap<U>(f: (value: T) => Maybe<U>): Maybe<U> {
    return f(this.value);
  }
}

export class None<T> implements Maybe<T> {
  private constructor() {
  }
  isDefined = false
  get value(): T {
    return this.get();
  }
  get(): T {
    throw new Error('None: accessing undefined value');
  }
  map<U>(f: (value: T) => U): Maybe<U> {
    return None.none;
  }
  flatMap<U>(f: (value: T) => Maybe<U>): Maybe<U> {
    return None.none;
  }
  static none: Maybe<any> = new None();
};

export const none: Maybe<any> = None.none;