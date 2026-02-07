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

    // Get the origin from the request (e.g., https://suyu.ai.kr)
    const origin = request.headers.get('origin') || request.nextUrl.origin;

    // Redirect to home page using the correct origin
    return NextResponse.redirect(`${origin}/`);
}
