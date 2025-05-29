'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '../AuthProvider' 

interface ProvidersProps {
  children: ReactNode
}

export function OrganizationProviders({ children }: Readonly<ProvidersProps>) {
  return (
      <AuthProvider>{children}</AuthProvider>
  )
}

export * from '../AuthProvider' 