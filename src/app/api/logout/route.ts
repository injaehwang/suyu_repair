import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    // Get the actual client-facing URL from headers
    const host = request.headers.get('host') || request.nextUrl.host;
    const proto = request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '');
    const redirectUrl = `${proto}://${host}/`;

    console.log('[LOGOUT] Request headers - host:', host, 'proto:', proto);
    console.log('[LOGOUT] Redirect URL:', redirectUrl);

    // Create redirect response
    const response = NextResponse.redirect(redirectUrl);

    // Force delete cookies using Set-Cookie headers with expired dates
    const cookiesToDelete = [
        '__Secure-authjs.session-token',
        '__Host-authjs.csrf-token',
        '__Secure-authjs.callback-url',
        'authjs.session-token',
        'authjs.csrf-token',
        'authjs.callback-url',
    ];

    // Build Set-Cookie headers to expire all cookies
    const setCookieHeaders: string[] = [];

    cookiesToDelete.forEach(cookieName => {
        // For __Host- prefixed cookies (no domain, must be secure, must be path=/)
        if (cookieName.startsWith('__Host-')) {
            setCookieHeaders.push(
                `${cookieName}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
            );
        }
        // For __Secure- prefixed cookies (must be secure)
        else if (cookieName.startsWith('__Secure-')) {
            setCookieHeaders.push(
                `${cookieName}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0;Expires=Thu, 01 Jan 1970 00:00:00 GMT`
            );
        }
        // For regular cookies
        else {
            setCookieHeaders.push(
                `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
            );
        }
    });

    // Set all cookie deletion headers
    setCookieHeaders.forEach(header => {
        response.headers.append('Set-Cookie', header);
    });

    console.log('[LOGOUT] Set-Cookie headers:', setCookieHeaders);

    return response;
}
