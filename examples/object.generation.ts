/*
 * Example of generating an object by building a generator from its field generators.
 */

import { Generators, Generator } from '../src';

class Person {
  constructor(readonly name: string,
              readonly surname: string,
              readonly age: number,
              readonly city: string) {}
}

const names = [ "John", "Martin", "George", "Oliver", "Olivia", "Sophia", "Lily", "Freya", "Ella" ];
const surnames = [ "Smith", "Jones", "Brown", "Taylor" ];
const cities = [ "London", "Liverpool", "Bristol", "Manchester", "Bolton" ]

let person = Generators.object(
  Person,
  Generators.oneOfValues(...names),
  Generators.oneOfValues(...surnames),
  Generators.choose(0, 120).map(age => Math.floor(age)),
  Generators.oneOfValues(...cities)
).generate();

console.log(person.get());