import { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function middleware(request: NextRequest) {
    // Skip middleware for organization details page as it handles its own auth check
    // if (request.nextUrl.pathname.startsWith('/organization/details')) {
    //     return NextResponse.next();
    // }

    const supabase = await createClient();

    const {
        data: { user }
    } = await supabase.auth.getUser()

    // If no user is logged in, redirect to signin
    if (!user) {
        return NextResponse.redirect(new URL('/organization/signin', request.url))
    }

    // Check if user has the organization role for organization-specific routes
    if (request.nextUrl.pathname.startsWith('/dashboard/')) {
        const userData = user.user_metadata;
        const userRole = userData?.role;

        if (userRole !== 'organization') {
            // Redirect non-organization users to a general dashboard or access denied page
            return NextResponse.redirect(new URL('/organization/signin', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/organization/details'
    ],
}
