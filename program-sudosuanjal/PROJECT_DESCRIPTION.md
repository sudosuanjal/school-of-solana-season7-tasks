# Project Description

**Deployed Frontend URL:** https://program-sudosuanjal.vercel.app/

**Solana Program ID:** 4qR9hdwNFQu4R23mwF3TcmBhW69qZpFPAVJGjmzsivZ3

## Project Overview

### Description

The Solana Diary dApp is a decentralized application built on the Solana blockchain, allowing users to create, update, and delete personal diary entries stored on-chain. Each diary entry is associated with a Program Derived Address (PDA) unique to the user and the entry's title, ensuring secure and private storage. The frontend, built using Next.js and TypeScript, provides a user-friendly interface to interact with the Solana program, enabling users to manage their diary entries seamlessly through a connected wallet.

The dApp leverages the Anchor framework for the Solana program and integrates with the Solana wallet adapter for user authentication and transaction signing. The frontend is styled with Tailwind CSS and shadcn/ui components, featuring a modal-based entry creation system and a sorted list of entries displayed in chronological order (most recent first).

### Key Features

- **Create Diary Entries**: Users can create new diary entries with a title (up to 30 bytes) and a message (up to 840 bytes), stored on-chain via a PDA.
- **Update Entries**: Users can modify the message of existing diary entries, with the updated timestamp recorded on-chain.
- **Delete Entries**: Users can delete their diary entries, closing the associated on-chain account and reclaiming SOL.
- **View Entries**: Entries are displayed in a card-based layout, sorted by creation time (newest first), with details like title, message, creation time, and last updated time.
- **Wallet Integration**: The dApp integrates with Solana wallets for secure user authentication and transaction signing.
- **Responsive UI**: The frontend is responsive, featuring a modal for creating entries and a clean, card-based interface for viewing and managing entries.

### How to Use the dApp

1. **Connect Wallet**
   - Navigate to the dApp's frontend (https://program-sudosuanjal.vercel.app/).
   - Click the "Connect Wallet" button and select a Solana-compatible wallet (e.g., Phantom).
   - Authorize the connection to link your wallet's public key to the dApp.
2. **Create a Diary Entry**:
   - Click the "Create Entry" button.
   - In the modal, enter a title (max 30 characters) and a message (max 840 characters).
   - Click "Create Entry" to submit the transaction, which creates a new on-chain account.
3. **View Diary Entries**:
   - After connecting your wallet, the diary page displays all your entries in a grid, sorted by creation time (newest first).
   - Each entry card shows the title, message, creation timestamp, and last updated timestamp (if applicable).
4. **Update an Entry**:
   - In an entry card, enter a new message in the "Update Message" textarea.
   - Click the "Update" button to submit the transaction, updating the message and timestamp on-chain.
5. **Delete an Entry**:
   - In an entry card, click the "Delete" button.
   - Confirm the deletion in the browser prompt to close the on-chain account and reclaim SOL.

## Program Architecture

### Overview

The Solana program is built using the Anchor framework and deployed on Devnet with the program ID `4qR9hdwNFQu4R23mwF3TcmBhW69qZpFPAVJGjmzsivZ3`. It consists of three main instructions: `create_diary_entry`, `update_diary_entry`, and `delete_diary_entry`. The program uses a single account type, `DiaryEntryState`, to store entry data, and all accounts are managed via PDAs derived from the user's public key and entry title.

### PDA Usage

Program Derived Addresses (PDAs) are used to uniquely identify and secure each diary entry account. The PDA ensures that only the owner (the wallet that created the entry) can modify or delete it.

**PDAs Used:**

- **Diary Entry PDA**:
  - **Purpose**: Represents a diary entry account storing the title, message, owner, and timestamps.
  - **Seeds**:
    - The entry title as a byte array (`title.as_bytes()`).
    - The owner's public key (`owner.key().as_ref()`).
  - **Reason**: The title and owner public key ensure uniqueness per user and entry, preventing collisions. The PDA allows the program to programmatically derive the account address and enforce ownership constraints.

### Program Instructions

The Solana program defines three instructions to manage diary entries:

**Instructions Implemented:**

- **create_diary_entry**:
  - Initializes a new `DiaryEntryState` account with a given title and message.
  - Validates that the title is ≤30 bytes and the message is ≤840 bytes.
  - Stores the owner's public key, title, message, and creation timestamp.
- **update_diary_entry**:
  - Updates the message of an existing diary entry.
  - Validates that the new message is ≤840 bytes.
  - Updates the `updated_at` timestamp with the current time.
- **delete_diary_entry**:
  - Closes an existing diary entry account, reclaiming SOL to the owner.
  - Validates that the provided title is ≤30 bytes and matches the PDA seeds.

### Account Structure

The program uses a single account structure, `DiaryEntryState`, to store diary entry data.

```rust
#[account]
pub struct DiaryEntryState {
    pub owner: Pubkey,           // The public key of the entry's owner (32 bytes)
    pub title: String,           // The title of the diary entry (up to 30 bytes)
    pub message: String,         // The content of the diary entry (up to 840 bytes)
    pub created_at: i64,         // Timestamp of when the entry was created
    pub updated_at: Option<i64>, // Timestamp of the last update (optional)
}
```

- **Purpose**: Stores all relevant data for a diary entry, including ownership, content, and timestamps.
- **Space Allocation**: The account size is fixed at `8 (discriminator) + 32 (Pubkey) + 4+30 (title) + 4+840 (message) + 8 (created_at) + 9 (updated_at)` bytes to accommodate the maximum allowed data.

## Testing

### Test Coverage

The testing suite, written in TypeScript using the Anchor framework, covers all three program instructions with both happy and unhappy path scenarios to ensure robust functionality.

**Happy Path Tests:**

- **create_diary_entry**: Verifies that a diary entry is created with valid title and message, and the account data (title, message, owner) is correctly stored.
- **update_diary_entry**: Confirms that an existing entry's message can be updated, and the new message and updated timestamp are correctly saved.
- **delete_diary_entry**: Ensures that an entry can be deleted, closing the account and making it inaccessible.

**Unhappy Path Tests:**

- **create_diary_entry (long title)**: Tests that creating an entry with a title exceeding 30 bytes fails with a `ConstraintRaw` error.
- **update_diary_entry (long message)**: Verifies that updating an entry with a message exceeding 840 bytes fails with a `ConstraintRaw` error.
- **delete_diary_entry (long title)**: Confirms that attempting to delete an entry with a title exceeding 30 bytes fails with a `ConstraintRaw` or seeds constraint error.

### Running Tests

To run the tests, use the following command in the Anchor project directory:

```bash
anchor test
```

### Additional Notes for Evaluators

- The frontend is built using the `create-solana-dapp` template (`web3js-next-tailwind-counter`) and customized to interact with the diary program. It uses Next.js, TypeScript, Tailwind CSS, and shadcn/ui components.
- The diary entries are sorted by creation time (newest first) in the frontend for better user experience.
- The `DiaryCreate` component is implemented as a modal, triggered by a button in the top right corner of the diary page, enhancing the UI's usability.
- The program and frontend handle edge cases like empty inputs and exceeding character limits with appropriate error messages via toast notifications.
