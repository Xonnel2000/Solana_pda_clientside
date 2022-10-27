import * as borsh from 'borsh';
import * as counter from './counter';


//turn a typescript class into a struct
class GreetingAccount {
  counter = 0;
  constructor(fields: {counter: number} | undefined = undefined) {
    if (fields) {
      this.counter = fields.counter;
    }
  }
}


const GreetingSchema = new Map([
  [GreetingAccount, {kind: 'struct', fields: [['counter', 'u32']]}],
]);


const GREETING_SIZE = borsh.serialize(
  GreetingSchema,
  new GreetingAccount(),
).length;


async function main() {
  await counter.example('counter', GREETING_SIZE);
}

main().then(
    () => process.exit(),
    err => {
      console.error(err);
      process.exit(-1);
    },
  );