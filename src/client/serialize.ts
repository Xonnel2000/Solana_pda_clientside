// import * as borsh from 'borsh';
// import * as counter from './counter';

// //PART 1

// // The state of a greeting account managed by the hello world program
// class GreetingAccount {
//     counter = 0;
//     constructor(fields: {counter: number} | undefined = undefined) {
//       if (fields) {
//         this.counter = fields.counter;
//       }
//     }
//   }
//   //Borsh schema definition for greeting accounts
//   const GreetingSchema = new Map([
//     [GreetingAccount, {kind: 'struct', fields: [['counter', 'u32']]}],
//   ]);
  
  
//   /* The expected size of each greeting account.
//   */
//   const GREETING_SIZE = borsh.serialize(
//    GreetingSchema,
//    new GreetingAccount(),
//   ).length;



//   //PART 2
// //call this outside the fuction
//   const StateInstructionLayout = borsh.struct([
//     borsh.u8('variant'),
//     borsh.str('title'),
//     borsh.str('text'),
//     borsh.str('poster_name'),
//     borsh.str('poster_url')
// ])

// // alloc the size
// let bufferPost = Buffer.alloc(1000)
// let bufferState = Buffer.alloc(1000)
//  const movieTitle = title

//  //const bufferState = Buffer.alloc(StateInstructionLayout.span);
//  // StateInstructionLayout.encode({
//  //   variant: 0
//  // }, bufferState);


//  //call this inside the function that send transaction
//  StateInstructionLayout.encode(
//      {
//          variant: 0,
//          title: movieTitle,
//          text: text,
//          poster_name: poster_name,
//          poster_url: poster_url
//      },
//      bufferState
//  )



// //get the size
//  bufferPost = bufferPost.slice(0, movieInstructionLayout.getSpan(bufferPost))
// bufferState = bufferState.slice(0, StateInstructionLayout.getSpan(bufferState))

//  console.log(bufferState)
//  console.log(bufferPost)
//  //deserialize the data
//  let mintPayloadCopy =  StateInstructionLayout.decode(bufferState)
//  console.log(mintPayloadCopy)