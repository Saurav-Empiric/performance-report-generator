import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
    const { email, password } = await request.json();
    
    if (!email || !password) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'signin successfully', user: data.user }, { status: 200 });
}
