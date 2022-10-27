use borsh::{BorshDeserialize, BorshSerialize};


use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};


pub mod instruction;
use  crate::instruction::HelloInstruction;


#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct GreetingAccount {
    pub counter: u32,
}


entrypoint!(process_instruction);
pub fn process_instruction(
    program_id: &Pubkey, // Public key of the account the hello world program was loaded into
    accounts: &[AccountInfo], // The account to say hello to
    instruction_data: &[u8], //  all the counter instructions data pass by the client,used to specify what operations the program should perform
) -> ProgramResult {
    
    msg!("Hello World Rust program entrypoint");
  
      let instruction = HelloInstruction::unpack(instruction_data)?;
      msg!("Instruction: {:?}", instruction);
 
      let accounts_iter = &mut accounts.iter();

      let account = next_account_info(accounts_iter)?;
  

      if account.owner != program_id {
          msg!("Greeted account does not have the correct program id");
          msg!("owner program_id {} {}", account.owner, program_id);
          //return an Error
          return Err(ProgramError::IncorrectProgramId);
      }
  

      let mut greeting_account = GreetingAccount::try_from_slice(&account.data.borrow())?;

         match instruction {
             HelloInstruction::Increment => {
                  greeting_account.counter += 1;
             },
             HelloInstruction::Decrement => {
                 greeting_account.counter -= 1;
             },
             HelloInstruction::Set(val) => {
                greeting_account.counter = val;
            },
         }
      

      greeting_account.serialize(&mut &mut account.data.borrow_mut()[..])?;
      msg!("Greeted {} time(s)!", greeting_account.counter);
  
    Ok(())

}