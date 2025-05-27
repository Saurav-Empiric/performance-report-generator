import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
    const { email } = await request.json();
    
    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${request.nextUrl.origin}/reset-password`,
    });
    
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Password reset email sent' }, { status: 200 });
} 