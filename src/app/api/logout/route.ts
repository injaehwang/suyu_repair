import { signOut } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    console.log('[LOGOUT] Starting logout process...');

    try {
        // Use NextAuth's built-in signOut function
        // This should properly clear all NextAuth cookies
        console.log('[LOGOUT] Calling NextAuth signOut...');
        await signOut({ redirect: false });
        console.log('[LOGOUT] NextAuth signOut completed');

        // Get redirect URL from request headers
        const host = request.headers.get('host') || 'suyu.ai.kr';
        const proto = request.headers.get('x-forwarded-proto') || 'https';
        const redirectUrl = `${proto}://${host}/`;

        console.log('[LOGOUT] Redirecting to:', redirectUrl);

        const response = NextResponse.redirect(redirectUrl);

        // Critical: Force browser to clear all data for this origin
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

        // Clear cookies for current domain and root domain variations
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
    } catch (error) {
        console.error('[LOGOUT] Error during logout:', error);
        // Fallback: redirect anyway
        return NextResponse.redirect('/');
    }
}
