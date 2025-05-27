import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ user: data.user }, { status: 200 });
} 