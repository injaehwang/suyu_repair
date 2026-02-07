import { signOut } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

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

        return NextResponse.redirect(redirectUrl);
    } catch (error) {
        console.error('[LOGOUT] Error during logout:', error);
        // Fallback: redirect anyway
        return NextResponse.redirect('/');
    }
}
