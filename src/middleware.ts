import { createClient } from './lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = await createClient();

    // Check if user is authenticated
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const url = req.nextUrl.clone();

    // Handle organization routes
    if (url.pathname.startsWith('/organization')) {
        // Skip auth check for signin and signup routes
        if (url.pathname === '/organization/signin' || url.pathname === '/organization/signup') {
            // If already authenticated as organization, redirect to dashboard
            if (user?.user_metadata?.role === 'organization') {
                url.pathname = '/organization/dashboard';
                return NextResponse.redirect(url);
            }
            return res;
        }

        // Protect all other organization routes
        if (!user || user.user_metadata?.role !== 'organization') {
            url.pathname = '/organization/signin';
            return NextResponse.redirect(url);
        }

        return res;
    }

    // Handle employee routes (not in /organization path)
    // Skip auth check for public routes
    if (url.pathname.startsWith('/api') ||
        url.pathname.startsWith('/login') ||
        url.pathname.startsWith('/signup') ||
        url.pathname.startsWith('/reset-password') ||
        url.pathname.startsWith('/update-password') ||
        url.pathname.startsWith('/_next') ||
        url.pathname === '/favicon.ico') {

        // If accessing login/signup while already authenticated as employee
        if ((url.pathname === '/login' || url.pathname === '/signup') &&
            user?.user_metadata?.role === 'employee') {
            url.pathname = '/';
            return NextResponse.redirect(url);
        }

        return res;
    }

    // Protect employee routes
    if (!user || user.user_metadata?.role !== 'employee') {
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    return res;
}

// Specify which routes this middleware should run on
export const config = {
    matcher: [
        // Organization routes
        '/organization/:path*',
        // Employee routes - everything except specific public pages
        '/((?!api|_next/static|_next/image|favicon.ico|login|signup|reset-password|update-password).*)',
    ],
};
