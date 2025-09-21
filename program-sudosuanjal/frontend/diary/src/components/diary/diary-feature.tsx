'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useDiaryProgram } from './diary-data-access'
import { DiaryCreate, DiaryList } from './diary-ui'
import { AppHero } from '../app-hero'
import { ellipsify } from '@/lib/utils'

export default function DiaryFeature() {
  const { publicKey } = useWallet()
  const { programId } = useDiaryProgram()

  return publicKey ? (
    <div>
      <AppHero
        title="Diary"
        subtitle={
          'Create a new diary entry by providing a title and message. Entries are stored on-chain and can be updated or deleted by the owner.'
        }
      >
        <p className="mb-6">
          <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p>
        <DiaryCreate />
      </AppHero>
      <DiaryList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  )
}
