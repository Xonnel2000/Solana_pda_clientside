import * as borsh from 'borsh';
import * as counter from './counter';


//turn a typescript class into a struct
class CounterAccount {
  counter = 0;
  constructor(fields: {counter: number} | undefined = undefined) {
    if (fields) {
      this.counter = fields.counter;
    }
  }
}


const CounterSchema = new Map([
  [CounterAccount, {kind: 'struct', fields: [['counter', 'u32']]}],
]);


const Counter_SIZE = borsh.serialize(
  CounterSchema,
  new CounterAccount(),
).length;


async function main() {
  await counter.example('counter', Counter_SIZE);
}

main().then(
    () => process.exit(),
    err => {
      console.error(err);
      process.exit(-1);
    },
  );