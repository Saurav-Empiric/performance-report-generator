import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: { message: 'Email and password are required' } },
        { status: 400 }
      );
    }
    
    // Get the user by email
    const { data, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (getUserError) {
      console.error('Error getting users:', getUserError);
      return NextResponse.json(
        { error: { message: 'Error retrieving users' } },
        { status: 500 }
      );
    }
    
    // Find the user with the matching email
    const user = data.users.find(u => u.email === email);
    
    if (!user) {
      return NextResponse.json(
        { error: { message: 'User not found' } },
        { status: 404 }
      );
    }
    
    // Update the user's password using admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password }
    );
    
    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json(
        { error: { message: 'Failed to update password' } },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Password updated successfully',
      userId: user.id
    });
    
  } catch (error: any) {
    console.error('Error setting password:', error);
    return NextResponse.json(
      { error: { message: error.message || 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
} 