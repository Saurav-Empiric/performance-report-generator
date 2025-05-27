'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useCurrentUser } from '@/hooks'
import { User } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
})

export const useAuth = () => useContext(AuthContext)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { data, isLoading } = useCurrentUser()

  const user = data?.user || null
  const isAuthenticated = !!user

  // Redirect unauthenticated users away from protected routes
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !pathname.includes('/organization/signin') && !pathname.includes('/organization/signup')) {
      router.push('/organization/signin')
    }
  }, [isAuthenticated, isLoading, pathname, router])

  const value = {
    user,
    isLoading,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 