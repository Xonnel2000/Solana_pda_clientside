
import {
    Keypair,
    Connection,
    PublicKey,
    LAMPORTS_PER_SOL,
    SystemProgram,
    TransactionInstruction,
    Transaction,
    sendAndConfirmTransaction,
} from '@solana/web3.js';


import {
    createKeypairFromFile,
} from './util';
//Usful fuction we need to use from our file system
import fs from 'mz/fs';
import os from 'os';
import path from 'path';
import yaml from 'yaml';
//This created by Solana team it is just a buffer layout structure
import * as BufferLayout from '@solana/buffer-layout';
//Remember the borsh Deserialize and Serialize data
import * as borsh from 'borsh';


/*
Path to Solana CLI config file.
*/
const CONFIG_FILE_PATH = path.resolve(
    os.homedir(),
    '.config',
    'solana',
    'cli',
    'config.yml',
);

let connection: Connection;
let localKeypair: Keypair;
let programKeypair: Keypair;
let programId: PublicKey;
let clientPubKey: PublicKey;



const PROGRAM_PATH = path.resolve(__dirname, '../../dist/program');


/*
Connect to dev net.
*/
export async function connect() {
    connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    console.log(`Successfully connected to Solana dev net.`);
}


/*
Use local keypair for client. 
*/
export async function getLocalAccount() {

    const configYml = await fs.readFile(CONFIG_FILE_PATH, {encoding: 'utf8'});
    console.log("this is readFile", configYml)
    const keypairPath = await yaml.parse(configYml).keypair_path;
    console.log("this is yaml.parse", keypairPath)
    localKeypair = await createKeypairFromFile(keypairPath);
    const airdropRequest = await connection.requestAirdrop(
        localKeypair.publicKey,
        //the amount we wanr to add
        LAMPORTS_PER_SOL*2,
    );
    await connection.confirmTransaction(airdropRequest);

    console.log(`Local account loaded successfully.`);
    console.log(`Local account's address is:`);
    console.log(`   ${localKeypair.publicKey}`);
} 


/*
Get the targeted program.
*/
export async function getProgram(programName: string) {
    programKeypair = await createKeypairFromFile(
        path.join(PROGRAM_PATH, programName + '-keypair.json')
    );
    programId = programKeypair.publicKey;
    console.log(`We're going to ping the ${programName} program.`);
    console.log(`It's Program ID is:`);
    console.log(`   ${programId.toBase58()}`)
}


/*
Configure client account.
*/
export async function configureClientAccount(accountSpaceSize: number) {
    const SEED = 'test1';
    clientPubKey = await PublicKey.createWithSeed(
        localKeypair.publicKey,
        SEED,
        programId,
    );

    console.log(`For simplicity's sake, we've created an address using a seed.`);
    console.log(`That seed is just the string "test(num)".`);
    console.log(`The generated address is:`);
    console.log(`   ${clientPubKey.toBase58()}`);

    const clientAccount = await connection.getAccountInfo(clientPubKey);
    if (clientAccount === null) {

        console.log(`Looks like that account does not exist. Let's create it.`);
        const transaction = new Transaction().add(
            SystemProgram.createAccountWithSeed({
                fromPubkey: localKeypair.publicKey,
                basePubkey: localKeypair.publicKey,
                seed: SEED,
                newAccountPubkey: clientPubKey,
                lamports: LAMPORTS_PER_SOL,
                space: accountSpaceSize,
                programId,
            }),
        );

        await sendAndConfirmTransaction(connection, transaction, [localKeypair]);
        console.log(`Client account created successfully.`);
    } else {
        console.log(`Looks like that account exists already. We can just use it.`);
    }
}


/*
Ping the program.
*/
export async function pingProgram(programName: string) {
    console.log(`All right, let's run it.`);
    console.log(`Pinging ${programName} program...`);

    const instruction = new TransactionInstruction({
        keys: [{pubkey: clientPubKey, isSigner: false, isWritable: true}],
        programId,
        data: createIncrementCounterInstructionData()
    });

    try {
    
        let tx = await sendAndConfirmTransaction(connection, new Transaction().add(instruction), [localKeypair])
              console.log(
            `Transaction submitted: https://explorer.solana.com/tx/${tx}?cluster=devnet`  
        )
    } catch (e) {
        console.log(JSON.stringify(e))
    }

    console.log(`Ping successful.`);
}

/* 
This function create call the IncrementInstructionData  Increment,
example enum HelloInstruction{
    Increment,
    Decrement,
    Set(u32)
}
*/

function createIncrementCounterInstructionData(): Buffer {
    const dataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction')
    ]);
  
    const data = Buffer.alloc(dataLayout.span);
    
    dataLayout.encode({
      instruction: 0
    }, 
    data);
    return data;
  }


  function createDecrementCounterInstructionData(): Buffer {
    const dataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction')
    ]);
  
    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode({
      instruction: 1
    }, data);
  
    return data;
  }


  function createSetCounterInstructionData(): Buffer {
    const dataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.u32('value')
    ]);
  
    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode({
      instruction: 2,
      value:100
    }, data);
  
    return data;
  }

/*   turn a typescript class into a struct
 */
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
  

      /**
   * Report the number of times the Counter account has been said hello to
   */
export async function reportCounter(): Promise<void> {
    const accountInfo = await connection.getAccountInfo(clientPubKey);
    if (accountInfo === null) {
      throw 'Error: cannot find the Counter account';
    }
    const greeting = borsh.deserialize(
      CounterSchema,
      CounterAccount,
      accountInfo.data,
    );
    //log the details
    console.log(
      clientPubKey.toBase58(),
      'has been Counter',
      greeting.counter,
      'time(s)',
    );
  }


/*
Run the example (main).
this function call other functions
*/
export async function example(programName: string, accountSpaceSize: number) {
//connect to the network
    await connect();
    //get the wallet addresss
    await getLocalAccount();
  //get the program id
   await getProgram(programName);
   //create a seed, create a PDA with the seed
   await configureClientAccount(accountSpaceSize);
   //send transaction to devnetv
   await pingProgram(programName);
   //deserialize and display the result
     await reportCounter();
}