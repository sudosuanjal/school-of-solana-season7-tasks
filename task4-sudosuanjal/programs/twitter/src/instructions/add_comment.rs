//-------------------------------------------------------------------------------
///
/// TASK: Implement the add comment functionality for the Twitter program
/// 
/// Requirements:
/// - Validate that comment content doesn't exceed maximum length
/// - Initialize a new comment account with proper PDA seeds
/// - Set comment fields: content, author, parent tweet, and bump
/// - Use content hash in PDA seeds for unique comment identification
/// 
///-------------------------------------------------------------------------------

use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_error::ProgramError;

use crate::errors::TwitterError;
use crate::states::*;

pub fn add_comment(ctx: Context<AddCommentContext>, comment_content: String) -> Result<()> {
    // Validate comment content length
    if comment_content.len() > COMMENT_LENGTH {
        return Err(TwitterError::CommentTooLong.into());
    }
    
    // Calculate the bump for the comment PDA
    let content_hash = anchor_lang::solana_program::hash::hash(comment_content.as_bytes());
    let comment_author_key = ctx.accounts.comment_author.key();
    let tweet_key = ctx.accounts.tweet.key();
    let content_hash_bytes = content_hash.to_bytes();
    
    let seeds = &[
        COMMENT_SEED.as_bytes(),
        comment_author_key.as_ref(),
        content_hash_bytes.as_ref(),
        tweet_key.as_ref(),
    ];
    let (expected_comment_key, bump) = Pubkey::find_program_address(seeds, ctx.program_id);
    
    // Verify that the comment account matches the expected PDA
    let comment_key = ctx.accounts.comment.key();
    if comment_key != expected_comment_key {
        return Err(ProgramError::InvalidAccountData.into());
    }
    
    let comment = &mut ctx.accounts.comment;
    
    // Set comment fields
    comment.comment_author = comment_author_key;
    comment.parent_tweet = tweet_key;
    comment.content = comment_content;
    comment.bump = bump;
    
    Ok(())
}

#[derive(Accounts)]
#[instruction(comment_content: String)]
pub struct AddCommentContext<'info> {
    #[account(mut)]
    pub comment_author: Signer<'info>,
    #[account(
        init,
        payer = comment_author,
        space = 8 + Comment::INIT_SPACE
    )]
    pub comment: Account<'info, Comment>,
    pub tweet: Account<'info, Tweet>,
    pub system_program: Program<'info, System>,
}