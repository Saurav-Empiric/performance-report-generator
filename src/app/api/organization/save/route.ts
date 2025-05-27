import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
    const { name, address, phone } = await request.json();

    if (!name) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get the current user to ensure they're authenticated
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    // Insert organization details into the organization table
    const { data, error } = await supabase
        .from('organization')
        .insert({
            name,
            email: userData.user.email, // email of the authenticated user
            address,
            phone,
            user_id: userData.user.id // Links to the authenticated user
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving organization details:', error);

        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Organization details saved successfully', organization: data }, { status: 200 });
} 