import { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function middleware(request: NextRequest) {
    const supabase = await createClient();

    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.redirect(new URL('/organization/signin', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*'],
}
