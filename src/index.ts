function forAll<T>(gen: Generator<T>, predicate: (x: T) => Boolean) {
  //TODO: Implement
}

function exists<T>(gen: Generator<T>, predicate: (x: T) => Boolean) {
  //TODO: Implement
}

abstract class Generator<T> {

  abstract generate(): T
}

class Generators {

  static choose(min: number, max: number): Generator<number> {
    return new (class extends Generator<number> {

      constructor(readonly min, readonly max) {
        super();
      }

      generate() {
        return Math.random() * (this.max - this.min) + this.min;
      }
    })(min, max);
  }
};

let value = Generators.choose(0, 10).generate();

console.log(value);