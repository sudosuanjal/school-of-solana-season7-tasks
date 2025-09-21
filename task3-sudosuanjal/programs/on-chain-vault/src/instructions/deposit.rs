use anchor_lang::accounts::system_account;
//-------------------------------------------------------------------------------
///
/// TASK: Implement the deposit functionality for the on-chain vault
/// 
/// Requirements:
/// - Verify that the user has enough balance to deposit
/// - Verify that the vault is not locked
/// - Transfer lamports from user to vault using CPI (Cross-Program Invocation)
/// - Emit a deposit event after successful transfer
/// 
///-------------------------------------------------------------------------------

use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::system_instruction::transfer;
use crate::state::Vault;
use crate::errors::VaultError;
use crate::events::DepositEvent;

#[derive(Accounts)]
pub struct Deposit<'info> {
   #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds=[b"vault", vault.vault_authority.as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,

    /// PDA vault SOL holding account (just a plain account)
    /// CHECK: This PDA receives the lamports
    #[account(
        mut,
        seeds = [b"vault", vault.vault_authority.as_ref()],
        bump
    )]
    pub vault_account: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn _deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    let user = &ctx.accounts.user;
    let vault= &ctx.accounts.vault;
    let vault_account = &ctx.accounts.vault_account;
    
    if vault.locked {
        return Err(VaultError::VaultLocked.into());
    }

    if **user.to_account_info().lamports.borrow() < amount{
        return Err(VaultError::InsufficientBalance.into());
    }
    
    let tx = transfer(user.key,vault_account.key, amount,);

    invoke(&tx, &[
        user.to_account_info(),
        vault_account.to_account_info(),
        ctx.accounts.system_program.to_account_info()
    ])?;

    emit!(DepositEvent{
        amount, 
        user: user.key(),
        vault:vault.key()
    });

    Ok(())
}