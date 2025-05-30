'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function EmployeeSignup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const email = searchParams.get('email') ?? '';
  const name = searchParams.get('name') ?? '';
  const role = searchParams.get('role') ?? '';
  const organization_id = searchParams.get('organization_id') ?? '';
  const department_id = searchParams.get('department_id') ?? null;
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const supabase = createClient();
  
  // Redirect if no email or organization_id in URL
  // useEffect(() => {
  //   if (!email || !organization_id) {
  //     toast.error('Invalid invitation link');
  //     router.push('/login');
  //   }
  // }, [email, organization_id, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create user account with employee role
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'employee',
            name,
            organization_id
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      
      if (signupError) {
        throw signupError;
      }
      
      if (!data.user) {
        throw new Error('Failed to create account');
      }
      
      // Create employee record in employees table
      const { error: employeeError } = await supabase
        .from('employees')
        .insert({
          name,
          role,
          email,
          department_id: department_id,
          organization_id
        });
      
      if (employeeError) {
        console.error('Error creating employee record:', employeeError);
        // Continue anyway as the auth account was created
      }
      
      toast.success('Account created successfully! Please check your email to verify your account.');
      router.push('/login');
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message ?? 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Complete Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your employee account
          </p>
        </div>
        
        <div className="mt-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-900">Your Information</h3>
            <div className="mt-2 space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">Name:</span>
                <span className="ml-2 text-sm text-gray-900">{name}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <span className="ml-2 text-sm text-gray-900">{email}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Role:</span>
                <span className="ml-2 text-sm text-gray-900">{role}</span>
              </div>
            </div>
          </div>
          
          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            
            {error && (
              <div className="text-sm text-red-600">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 