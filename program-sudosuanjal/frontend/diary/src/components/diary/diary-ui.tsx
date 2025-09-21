'use client'

import { PublicKey } from '@solana/web3.js'
import { useState } from 'react'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useDiaryProgram, useDiaryProgramAccount } from './diary-data-access'
import { ellipsify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'

export function DiaryCreate() {
  const { createEntry } = useDiaryProgram()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [open, setOpen] = useState(false)

  const handleCreate = () => {
    if (title.trim() === '' || message.trim() === '') {
      toast.error('Title and message are required')
      return
    }
    if (title.length > 30) {
      toast.error('Title must be 30 characters or less')
      return
    }
    if (message.length > 840) {
      toast.error('Message must be 840 characters or less')
      return
    }
    createEntry.mutateAsync({ title, message }).then(() => {
      setTitle('')
      setMessage('')
      setOpen(false)
    })
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="border-2 rounded-lg font-serif text-lg">
        🚀 Create Entry
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-6 rounded-lg border-4 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl font-bold font-serif tracking-wide">
              ✨ Create New Entry ✨
            </DialogTitle>
            <div className="w-24 h-1 bg-muted mx-auto mt-2 rounded-full"></div>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="font-bold text-lg font-serif">
                📝 Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title (max 30 chars)"
                className="mt-2 border-2 rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="message" className="font-bold text-lg font-serif">
                💭 Message
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message (max 840 chars)"
                rows={5}
                className="mt-2 border-2 rounded-lg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreate}
              disabled={createEntry.isPending}
              className="w-full border-2 rounded-lg font-serif text-lg"
            >
              🚀 Create Entry {createEntry.isPending && '...'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function DiaryList() {
  const { accounts, getProgramAccount } = useDiaryProgram()

  if (getProgramAccount.isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="rounded-full h-16 w-16 border-4 border-t-muted-foreground"></div>
        <span className="ml-4 font-bold font-serif text-lg">Loading...</span>
      </div>
    )
  }

  if (!getProgramAccount.data?.value) {
    return (
      <div className="border-4 rounded-lg p-6 text-center shadow-lg">
        <span className="font-bold font-serif text-lg">
          ⚠️ Program account not found. Make sure you have deployed the program and are on the correct cluster.
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* <div className="flex justify-between items-center">
        <div className="text-center flex-1">
          <h2 className="text-4xl font-bold font-serif tracking-wide">📚 Your Diary Entries</h2>
          <div className="w-32 h-1 bg-muted mx-auto mt-2 rounded-full"></div>
        </div>
        <DiaryCreate />
      </div> */}

      {accounts.isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="rounded-full h-16 w-16 border-4 border-t-muted-foreground"></div>
          <span className="ml-4 font-bold font-serif text-lg">Loading entries...</span>
        </div>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-6">
          {accounts.data
            ?.sort((a, b) => b.account.createdAt.toNumber() - a.account.createdAt.toNumber())
            .map((entry) => (
              <DiaryCard key={entry.publicKey.toString()} account={entry.publicKey} />
            ))}
        </div>
      ) : (
        <div className="text-center p-8 rounded-lg border-4 shadow-lg">
          <h2 className="text-3xl font-bold font-serif mb-4">📖 No entries yet!</h2>
          <p className="text-lg font-mono">
            No diary entries found. Create one above to get started on your journey! ✨
          </p>
        </div>
      )}
    </div>
  )
}

function DiaryCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateMutation, deleteMutation } = useDiaryProgramAccount({ account })
  const [newMessage, setNewMessage] = useState('')

  if (accountQuery.isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="rounded-full h-12 w-12 border-4 border-t-muted-foreground"></div>
      </div>
    )
  }

  const entry = accountQuery.data
  if (!entry) return null

  const createdAt = new Date(entry.createdAt.toNumber() * 1000).toLocaleString()
  const updatedAt = entry.updatedAt ? new Date(entry.updatedAt.toNumber() * 1000).toLocaleString() : 'N/A'

  const handleUpdate = () => {
    if (newMessage.trim() === '') return
    if (newMessage.length > 840) {
      toast.error('Message must be 840 characters or less')
      return
    }
    updateMutation.mutateAsync(newMessage).then(() => setNewMessage(''))
  }

  return (
    <Card className="border-4 shadow-2xl">
      <CardHeader className="border-b-4">
        <CardTitle className="text-2xl font-serif font-bold">✨ {entry.title}</CardTitle>
        <CardDescription className="font-mono">
          🔗 Account: <ExplorerLink path={`account/${account}`} label={ellipsify(account.toString())} />
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        <div className="p-4 rounded-lg border-2">
          <p className="font-mono">
            <strong className="font-serif">💭 Message:</strong> {entry.message}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 rounded-lg border-2">
            <p className="font-mono">
              <strong className="font-serif">📅 Created:</strong>
              <br />
              {createdAt}
            </p>
          </div>
          <div className="p-3 rounded-lg border-2">
            <p className="font-mono">
              <strong className="font-serif">🔄 Updated:</strong>
              <br />
              {updatedAt}
            </p>
          </div>
        </div>

        <div className="space-y-4 p-4 rounded-lg border-2">
          <div>
            <Label htmlFor="update-message" className="font-bold font-serif text-lg">
              ✏️ Update Message
            </Label>
            <Textarea
              id="update-message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Enter new message"
              rows={3}
              className="mt-2 border-2 rounded-lg"
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending || newMessage.trim() === ''}
              className="flex-1 border-2 rounded-lg font-serif"
            >
              🔄 Update
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!window.confirm('Are you sure you want to delete this entry?')) {
                  return
                }
                deleteMutation.mutateAsync()
              }}
              disabled={deleteMutation.isPending}
              className="flex-1 border-2 rounded-lg font-serif"
            >
              🗑️ Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
