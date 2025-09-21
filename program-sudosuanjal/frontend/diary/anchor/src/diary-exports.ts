// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import DiaryIDL from '../target/idl/diary.json'
import type { Diary } from '../target/types/diary'

// Re-export the generated IDL and type
export { Diary, DiaryIDL }

// The programId is imported from the program IDL.
export const DIARY_PROGRAM_ID = new PublicKey(DiaryIDL.address)

// This is a helper function to get the Diary Anchor program.
export function getDiaryProgram(provider: AnchorProvider, address?: PublicKey): Program<Diary> {
  return new Program({ ...DiaryIDL, address: address ? address.toBase58() : DiaryIDL.address } as Diary, provider)
}

// This is a helper function to get the program ID for the Counter program depending on the cluster.
export function getDiaryProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Diary program on devnet and testnet.
      return new PublicKey('4qR9hdwNFQu4R23mwF3TcmBhW69qZpFPAVJGjmzsivZ3')
    case 'mainnet-beta':
    default:
      return DIARY_PROGRAM_ID
  }
}
