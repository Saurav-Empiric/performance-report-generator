'use client'

import { ReactNode } from 'react'
import { QueryProvider } from './QueryProvider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: Readonly<ProvidersProps>) {
  return (
    <QueryProvider>
      {children}
    </QueryProvider>
  )
}

export * from './QueryProvider'
