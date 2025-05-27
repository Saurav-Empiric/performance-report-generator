import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
    const { password } = await request.json();
    
    if (!password) {
        return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
} 