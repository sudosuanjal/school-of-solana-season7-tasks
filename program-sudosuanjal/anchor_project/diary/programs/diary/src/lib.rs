use anchor_lang::prelude::*;
declare_id!("4qR9hdwNFQu4R23mwF3TcmBhW69qZpFPAVJGjmzsivZ3");

#[program]
pub mod diary {
    use super::*;

    pub fn create_diary_entry(
        ctx: Context<CreateEntry>,
        title: String,
        message: String,
    ) -> Result<()> {
        if title.as_bytes().len() > 30 {
            return Err(anchor_lang::error::ErrorCode::ConstraintRaw.into());
        }
        if message.as_bytes().len() > 840 {
            return Err(anchor_lang::error::ErrorCode::ConstraintRaw.into());
        }
        msg!("diary entry created!");
        msg!("title: {}", title);
        msg!("message: {}", message);
        let diary_entry = &mut ctx.accounts.diary_entry;
        diary_entry.owner = ctx.accounts.owner.key();
        diary_entry.title = title;
        diary_entry.message = message;
        diary_entry.created_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn update_diary_entry(
        ctx: Context<UpdateEntry>,
        message: String,
    ) -> Result<()> {
        if message.as_bytes().len() > 840 {
            return Err(anchor_lang::error::ErrorCode::ConstraintRaw.into());
        }
        msg!("diary entry updated");
        msg!("message: {}", message);
        let diary_entry = &mut ctx.accounts.diary_entry;
        diary_entry.message = message;
        diary_entry.updated_at = Some(Clock::get()?.unix_timestamp);
        Ok(())
    }

    pub fn delete_diary_entry(
        ctx: Context<DeleteEntry>,
        title: String,
    ) -> Result<()> {
        if title.as_bytes().len() > 30 {
            return Err(anchor_lang::error::ErrorCode::ConstraintRaw.into());
        }
        msg!("diary entry deleted");
        msg!("title: {}", title);
        Ok(())
    }
}

#[account]
pub struct DiaryEntryState {
    pub owner: Pubkey,
    pub title: String,
    pub message: String,
    pub created_at: i64,
    pub updated_at: Option<i64>,
}

#[derive(Accounts)]
#[instruction(title: String, message: String)]
pub struct CreateEntry<'info> {
    #[account(
        init,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        payer = owner,
        space = 8 + 32 + 4 + 30 + 4 + 840 + 8 + 9
    )]
    pub diary_entry: Account<'info, DiaryEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(message: String)]
pub struct UpdateEntry<'info> {
    #[account(
        mut,
        seeds = [diary_entry.title.as_bytes(), owner.key().as_ref()],
        bump,
        realloc = 8 + 32 + 4 + 30 + 4 + 840 + 8 + 9,
        realloc::payer = owner,
        realloc::zero = true
    )]
    pub diary_entry: Account<'info, DiaryEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteEntry<'info> {
    #[account(
        mut,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        close = owner
    )]
    pub diary_entry: Account<'info, DiaryEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}