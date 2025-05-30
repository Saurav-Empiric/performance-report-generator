import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { email, name, role, department_id } = await req.json();
    
    if (!email || !name || !role) {
      return NextResponse.json(
        { error: 'Email, name, and role are required' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Get current user's info
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting current user:', userError);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get organization for current user
    const { data: orgData, error: orgError } = await supabase
      .from('organization')
      .select('id, name')
      .eq('user_id', user.id)
      .single();
    
    if (orgError || !orgData) {
      console.error('Error getting organization:', orgError);
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }
    
    // invitation URL with custom sign-up path
    let signUpURL = `${process.env.NEXT_PUBLIC_APP_URL}/signup?organization_id=${orgData.id}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&role=${encodeURIComponent(role)}`;
    
    if (department_id) {
      signUpURL += `&department_id=${department_id}`;
    }
    
    // Send invitation email
    const { error: emailError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        organization_id: orgData.id,
        name: name,
        role: 'employee',
        invited_by: user.id
      },
      redirectTo: signUpURL
    });
    
    if (emailError) {
      console.error('Error sending invitation email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send invitation email' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: `Invitation sent to ${email}`
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error sending employee invitation:', error);
    return NextResponse.json(
      { error: 'Failed to send employee invitation' },
      { status: 500 }
    );
  }
} 