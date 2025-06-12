'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

function SignupForm() {
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
  useEffect(() => {
    if (!email || !organization_id) {
      toast.error('Invalid invitation link');
      router.push('/login');
    }
  }, [email, organization_id, router]);
  
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
      // Set the password using our API endpoint
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to set password');
      }
      
      // Update the employee record with the user_id
      if (data.userId) {
        // Find the existing employee record
        const { data: employee, error: findError } = await supabase
          .from('employees')
          .select('id, user_id')
          .eq('email', email)
          .eq('organization_id', organization_id)
          .single();
        
        if (!findError && employee && !employee.user_id) {
          // Update the employee record with the user_id
          await supabase
            .from('employees')
            .update({ user_id: data.userId })
            .eq('id', employee.id);
        }
      }
      
      toast.success('Account created successfully! Please login to continue.');
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
            Set your password to access the system
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
              {isLoading ? 'Setting Password...' : 'Set Password & Login'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeSignup() {
  return (
    <Suspense fallback={<Loader2 className="flex items-center justify-center animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"/>}>
      <SignupForm />
    </Suspense>
  );
} 