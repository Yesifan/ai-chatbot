import * as React from 'react'
import { type Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/app/actions/auth'

import { Siderbar } from '../../features/sidebar'

export const runtime = 'edge'

export async function generateMetadata(): Promise<Metadata> {
  const session = await auth()

  if (!session) {
    redirect(`/?next=/history`)
  }

  return {
    title: 'History Chat'
  }
}

export default async function ChatHistoryPage() {
  return <Siderbar />
}
