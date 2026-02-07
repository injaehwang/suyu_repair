import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        AUTH_URL: process.env.AUTH_URL,
        AUTH_SECRET_EXISTS: !!process.env.AUTH_SECRET,
        AUTH_Secret_Length: process.env.AUTH_SECRET?.length,
        AUTH_GOOGLE_ID_EXISTS: !!process.env.AUTH_GOOGLE_ID,
        AUTH_NAVER_ID_EXISTS: !!process.env.AUTH_NAVER_ID,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        BACKEND_URL: process.env.BACKEND_URL,
        AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
        NODE_ENV: process.env.NODE_ENV,
    });
}
