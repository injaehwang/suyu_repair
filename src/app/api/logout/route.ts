import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    // Delete all auth-related cookies
    const cookieStore = await cookies();

    // List of all possible NextAuth cookie names
    const authCookies = [
        'authjs.session-token',
        '__Secure-authjs.session-token',
        'authjs.callback-url',
        '__Secure-authjs.callback-url',
        'authjs.csrf-token',
        '__Secure-authjs.csrf-token',
    ];

    // Delete each cookie
    authCookies.forEach(cookieName => {
        cookieStore.delete(cookieName);
    });

    // Get the actual client-facing URL from headers
    // Amplify/CloudFront sets these headers with the original request info
    const host = request.headers.get('host') || request.nextUrl.host;
    const proto = request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '');
    const redirectUrl = `${proto}://${host}/`;

    console.log('[LOGOUT] Request headers - host:', host, 'proto:', proto);
    console.log('[LOGOUT] Redirect URL:', redirectUrl);

    return NextResponse.redirect(redirectUrl);
}
