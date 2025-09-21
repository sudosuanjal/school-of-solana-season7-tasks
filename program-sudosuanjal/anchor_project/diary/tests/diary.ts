import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Diary } from "../target/types/diary";
import { expect } from "chai";

describe("diary", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Diary as Program<Diary>;

  let owner = anchor.web3.Keypair.generate();

  before(async () => {
    // Airdrop SOL to owner
    const signature = await provider.connection.requestAirdrop(
      owner.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);
  });

  // Test 1: create_diary_entry instruction
  describe("create_diary_entry", () => {
    it("should create diary entry - happy path", async () => {
      const title = "Test Entry";
      const message = "This is a test message";

      const [diaryEntryPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(title), owner.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .createDiaryEntry(title, message)
        .accountsPartial({
          diaryEntry: diaryEntryPda,
          owner: owner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([owner])
        .rpc();

      const account = await program.account.diaryEntryState.fetch(
        diaryEntryPda
      );
      expect(account.title).to.equal(title);
      expect(account.message).to.equal(message);
    });

    it("should fail with long title - unhappy path", async () => {
      const longTitle = "A".repeat(31); // Exceeds 30 byte limit
      const message = "Test message";

      const [diaryEntryPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(longTitle), owner.publicKey.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .createDiaryEntry(longTitle, message)
          .accountsPartial({
            diaryEntry: diaryEntryPda,
            owner: owner.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([owner])
          .rpc();
        expect.fail("Should have failed");
      } catch (error) {
        expect(error.toString()).to.include("ConstraintRaw");
      }
    });
  });

  // Test 2: update_diary_entry instruction
  describe("update_diary_entry", () => {
    const title = "Update Test";
    let diaryEntryPda;

    before(async () => {
      [diaryEntryPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(title), owner.publicKey.toBuffer()],
        program.programId
      );

      // Create entry first
      await program.methods
        .createDiaryEntry(title, "Original message")
        .accountsPartial({
          diaryEntry: diaryEntryPda,
          owner: owner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([owner])
        .rpc();
    });

    it("should update diary entry - happy path", async () => {
      const newMessage = "Updated message";

      await program.methods
        .updateDiaryEntry(newMessage)
        .accountsPartial({
          diaryEntry: diaryEntryPda,
          owner: owner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([owner])
        .rpc();

      const account = await program.account.diaryEntryState.fetch(
        diaryEntryPda
      );
      expect(account.message).to.equal(newMessage);
    });

    it("should fail with long message - unhappy path", async () => {
      const longMessage = "A".repeat(841); // Exceeds 840 byte limit

      try {
        await program.methods
          .updateDiaryEntry(longMessage)
          .accountsPartial({
            diaryEntry: diaryEntryPda,
            owner: owner.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([owner])
          .rpc();
        expect.fail("Should have failed");
      } catch (error) {
        expect(error.toString()).to.include("ConstraintRaw");
      }
    });
  });

  // Test 3: delete_diary_entry instruction
  describe("delete_diary_entry", () => {
    const title = "Delete Test";
    let diaryEntryPda;

    beforeEach(async () => {
      [diaryEntryPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(title), owner.publicKey.toBuffer()],
        program.programId
      );

      // Create entry first
      await program.methods
        .createDiaryEntry(title, "Message to delete")
        .accountsPartial({
          diaryEntry: diaryEntryPda,
          owner: owner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([owner])
        .rpc();
    });

    it("should delete diary entry - happy path", async () => {
      await program.methods
        .deleteDiaryEntry(title)
        .accountsPartial({
          diaryEntry: diaryEntryPda,
          owner: owner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([owner])
        .rpc();

      // Verify entry is deleted
      try {
        await program.account.diaryEntryState.fetch(diaryEntryPda);
        expect.fail("Account should be deleted");
      } catch (error) {
        expect(error.toString()).to.include("Account does not exist");
      }
    });

    it("should fail with long title - unhappy path", async () => {
      const longTitle = "A".repeat(31); // Exceeds 30 byte limit

      try {
        await program.methods
          .deleteDiaryEntry(longTitle)
          .accountsPartial({
            diaryEntry: diaryEntryPda, // Using existing PDA, but passing long title to instruction
            owner: owner.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([owner])
          .rpc();
        expect.fail("Should have failed");
      } catch (error) {
        // Check for either ConstraintRaw (title validation) or seeds constraint violation
        const errorString = error.toString();
        const hasConstraintRaw = errorString.includes("ConstraintRaw");
        const hasSeedsError = errorString.includes("seeds constraint");
        expect(hasConstraintRaw || hasSeedsError).to.be.true;
      }
    });
  });
});
