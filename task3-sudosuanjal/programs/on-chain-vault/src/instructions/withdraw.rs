use std::collections::hash_map::ValuesMut;

//-------------------------------------------------------------------------------
///
/// TASK: Implement the withdraw functionality for the on-chain vault
/// 
/// Requirements:
/// - Verify that the vault is not locked
/// - Verify that the vault has enough balance to withdraw
/// - Transfer lamports from vault to vault authority
/// - Emit a withdraw event after successful transfer
/// 
///-------------------------------------------------------------------------------

use anchor_lang::prelude::*;
use crate::state::Vault;
use crate::errors::VaultError;
use crate::events::WithdrawEvent;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub vault_authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", vault.vault_authority.as_ref()],
        bump,
        constraint = vault.vault_authority == vault_authority.key() 
    )]
    pub vault: Account<'info, Vault>,

    /// The actual vault PDA that holds lamports
    /// CHECK: This PDA holds the lamports; not a typed account
    #[account(
        mut,
        seeds = [b"vault", vault.vault_authority.as_ref()],
        bump
    )]
    pub vault_account: AccountInfo<'info>,

    pub system_program: Program<'info, System>

    
}

pub fn _withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let vault = &ctx.accounts.vault;
    let vault_account = &ctx.accounts.vault_account;
    let vault_authority = &ctx.accounts.vault_authority;

    if vault.locked{
        return Err(VaultError::VaultLocked.into())
    }

    let vautl_lamports = **vault_account.lamports.borrow();
    if vautl_lamports < amount {
        return Err(VaultError::InsufficientBalance.into())
    }

    **vault_account.try_borrow_mut_lamports()?  -= amount;
    **vault_authority.to_account_info().try_borrow_mut_lamports()? += amount;

    emit!(WithdrawEvent{
        amount,
        vault_authority:vault_authority.key(),
        vault: vault.key()
    });

    Ok(())
}