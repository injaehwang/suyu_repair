import { signOut } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    console.log('[LOGOUT] Starting logout process...');

    // 1. Attempt Server-Side SignOut
    try {
        console.log('[LOGOUT] Calling NextAuth signOut...');
        await signOut({ redirect: false });
        console.log('[LOGOUT] NextAuth signOut completed');
    } catch (error) {
        console.error('[LOGOUT] Error during NextAuth signOut (non-fatal):', error);
    }

    // 2. Prepare Response (Always Redirect to Home)
    const host = request.headers.get('host') || 'suyu.ai.kr';
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const redirectUrl = `${proto}://${host}/`;

    console.log('[LOGOUT] Redirecting to:', redirectUrl);
    const response = NextResponse.redirect(redirectUrl);

    // 3. Apply Critical Headers (Unconditional)
    // Force browser to clear all data for this origin
    response.headers.set('Clear-Site-Data', '"cookies", "storage", "cache"');

    // Also force manual expiry of the domain cookie just in case Clear-Site-Data misses it (e.g. subdomains)
    if (process.env.NODE_ENV === 'production') {
        response.cookies.set('__Secure-authjs.session-token', '', {
            path: '/',
            domain: '.suyu.ai.kr',
            maxAge: 0
        });
    }

    // Force no-cache
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    // Force expiry of known NextAuth cookies
    const cookieOptions = { path: '/', secure: true, sameSite: 'lax' as const };
    const domains = [undefined, 'suyu.ai.kr', '.suyu.ai.kr'];

    domains.forEach(domain => {
        const opts = { ...cookieOptions, domain };
        // 1. Standard NextAuth Token
        response.cookies.set('next-auth.session-token', '', { ...opts, maxAge: 0 });
        // 2. Secure V5 handling (authjs)
        response.cookies.set('__Secure-authjs.session-token', '', { ...opts, maxAge: 0 });
        // 3. Legacy / Other possible names
        response.cookies.set('__Secure-next-auth.session-token', '', { ...opts, maxAge: 0 });
        response.cookies.set('__Host-next-auth.csrf-token', '', { ...opts, maxAge: 0 });
        response.cookies.set('__Host-authjs.csrf-token', '', { ...opts, maxAge: 0 });
    });

    return response;
}
