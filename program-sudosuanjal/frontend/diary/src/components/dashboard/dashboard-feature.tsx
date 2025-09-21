'use client'

import { AppHero } from '@/components/app-hero'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function DashboardFeature() {
  return (
    <div className="min-h-screen">
      <AppHero
        title="Welcome to Your Solana Diary"
        subtitle="Capture your thoughts securely on the Solana blockchain. Create, update, and manage your personal diary entries with the power of decentralized technology."
      />
      <div className="max-w-4xl mx-auto py-12 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Start Writing Your Story</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Your diary is private, secure, and stored on-chain. Begin your journey by creating your first entry.
            </p>
            <Link href="/diary">
              <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full text-lg">
                Go to Your Diary
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
