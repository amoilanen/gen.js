import { Generators, Generator } from './generator';
import { Maybe } from './maybe';
import { forAll, exists } from './quantifiers';

export { Generators, Generator, Maybe, forAll, exists };


let value = Generators.choose(0, 10).generate();

console.log(value);

//TODO: Convert this to tests for Maybe
let x: Maybe<number> = Maybe.from(2);
console.log(x.isDefined);
console.log(x.value);

let y: Maybe<number> = Maybe.from<number>(null);
console.log(y.isDefined);
//console.log(y.value);