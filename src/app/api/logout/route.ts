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

    // Use nextUrl to get the current request URL
    // This will be https://suyu.ai.kr in production
    // and http://localhost:3000 in development
    const protocol = request.nextUrl.protocol;
    const host = request.nextUrl.host;
    const redirectUrl = `${protocol}//${host}/`;

    console.log('[LOGOUT] Redirect URL:', redirectUrl);

    return NextResponse.redirect(redirectUrl);
}
