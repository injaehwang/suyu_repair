import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    // Create response with redirect
    const host = request.headers.get('host') || request.nextUrl.host;
    const proto = request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '');
    const redirectUrl = `${proto}://${host}/`;

    console.log('[LOGOUT] Request headers - host:', host, 'proto:', proto);
    console.log('[LOGOUT] Redirect URL:', redirectUrl);

    const response = NextResponse.redirect(redirectUrl);

    // Delete all possible auth cookies with explicit parameters
    const cookiesToDelete = [
        'authjs.session-token',
        '__Secure-authjs.session-token',
        'authjs.callback-url',
        '__Secure-authjs.callback-url',
        'authjs.csrf-token',
        '__Secure-authjs.csrf-token',
    ];

    cookiesToDelete.forEach(cookieName => {
        // Delete with various path combinations
        response.cookies.delete(cookieName);
        response.cookies.delete({ name: cookieName, path: '/' });
        response.cookies.delete({ name: cookieName, path: '/', domain: host });

        // Also set expired cookie as backup
        response.cookies.set(cookieName, '', {
            expires: new Date(0),
            path: '/',
            maxAge: 0,
        });
    });

    console.log('[LOGOUT] Cookies deleted');

    return response;
}
