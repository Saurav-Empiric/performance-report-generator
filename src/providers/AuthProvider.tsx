'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useCurrentUser } from '@/hooks'
import { User } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  userRole: string | null
  organizationDetails: {
    name: string | null
    companyAddress: string | null
    phoneNumber: string | null
  } | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  userRole: null,
  organizationDetails: null
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
  
  // Extract role and organization details from user metadata
  const userRole = user?.user_metadata?.role || null
  const organizationDetails = user ? {
    name: user.user_metadata?.name || null,
    companyAddress: user.user_metadata?.companyAddress || null,
    phoneNumber: user.user_metadata?.phoneNumber || null
  } : null

  // Redirect unauthenticated users away from protected routes
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !pathname.includes('/organization/signin') && !pathname.includes('/organization/signup')) {
      // router.push('/organization/signin')
    }
  }, [isAuthenticated, isLoading, pathname, router])

  const value = {
    user,
    isLoading,
    isAuthenticated,
    userRole,
    organizationDetails
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 