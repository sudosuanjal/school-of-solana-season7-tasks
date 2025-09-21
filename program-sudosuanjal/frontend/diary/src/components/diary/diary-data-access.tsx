'use client'

import { getDiaryProgram, getDiaryProgramId } from '@project/anchor'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Cluster, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'

export function useDiaryProgram() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getDiaryProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getDiaryProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['diary-entry', 'all', { cluster, publicKey }],
    queryFn: () =>
      program.account.diaryEntryState
        .all()
        .then((entries) => entries.filter((entry) => entry.account.owner.equals(publicKey!))),
    enabled: !!publicKey,
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const createEntry = useMutation({
    mutationKey: ['diary-entry', 'create', { cluster }],
    mutationFn: async ({ title, message }: { title: string; message: string }) => {
      if (!provider.publicKey) throw new Error('Wallet not connected')
      const [pda] = PublicKey.findProgramAddressSync([Buffer.from(title), provider.publicKey.toBuffer()], programId)
      return program.methods
        .createDiaryEntry(title, message)
        .accounts({ diaryEntry: pda } as unknown)
        .rpc()
    },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: (error) => {
      toast.error(`Failed to create entry: ${error.message}`)
    },
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createEntry,
  }
}

export function useDiaryProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useDiaryProgram()

  const accountQuery = useQuery({
    queryKey: ['diary-entry', 'fetch', { cluster, account }],
    queryFn: () => program.account.diaryEntryState.fetch(account),
  })

  const updateMutation = useMutation({
    mutationKey: ['diary-entry', 'update', { cluster, account }],
    mutationFn: (message: string) =>
      program.methods
        .updateDiaryEntry(message)
        .accounts({ diaryEntry: account } as unknown)
        .rpc(),
    onSuccess: async (tx) => {
      transactionToast(tx)
      await accountQuery.refetch()
    },
    onError: (error) => {
      toast.error(`Failed to update entry: ${error.message}`)
    },
  })

  const deleteMutation = useMutation({
    mutationKey: ['diary-entry', 'delete', { cluster, account }],
    mutationFn: () => {
      if (!accountQuery.data) throw new Error('Entry data not loaded')
      return program.methods
        .deleteDiaryEntry(accountQuery.data.title)
        .accounts({ diaryEntry: account } as unknown)
        .rpc()
    },
    onSuccess: async (tx) => {
      transactionToast(tx)
      await accounts.refetch()
    },
    onError: (error) => {
      toast.error(`Failed to delete entry: ${error.message}`)
    },
  })

  return {
    accountQuery,
    updateMutation,
    deleteMutation,
  }
}
