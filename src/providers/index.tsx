'use client'

import { ReactNode } from 'react'
import { QueryProvider } from './QueryProvider'
import { AuthProvider } from './AuthProvider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  )
}

export * from './QueryProvider'
export * from './AuthProvider' 