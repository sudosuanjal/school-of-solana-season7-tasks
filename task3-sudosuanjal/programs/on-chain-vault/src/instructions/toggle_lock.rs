use anchor_lang::prelude::*;
use crate::state::Vault;
use crate::events::ToggleLockEvent;
use crate::errors::VaultError;

#[derive(Accounts)]
pub struct ToggleLock<'info> {
    
    #[account(mut)]
    pub vault_authority: Signer<'info>,

    
    #[account(
        mut,
        seeds = [b"vault", vault.vault_authority.as_ref()],
        bump,
        constraint = vault.vault_authority == vault_authority.key()
    )]
    pub vault: Account<'info, Vault>,
}

pub fn _toggle_lock(ctx: Context<ToggleLock>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;

   
    vault.locked = !vault.locked;

    
    emit!(ToggleLockEvent {
        vault: vault.key(),
        vault_authority: vault.vault_authority,
        locked: vault.locked,
    });

    Ok(())
}
