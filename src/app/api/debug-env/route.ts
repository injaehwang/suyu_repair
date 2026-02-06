import { NextResponse } from "next/server";

export async function GET() {
    const googleId = process.env.AUTH_GOOGLE_ID;
    const nextAuthUrl = process.env.NEXTAUTH_URL;

    return NextResponse.json({
        debug_status: "ok",
        env_check: {
            AUTH_GOOGLE_ID_EXISTS: !!googleId,
            AUTH_GOOGLE_ID_PREFIX: googleId ? googleId.substring(0, 10) + "..." : "MISSING",
            AUTH_GOOGLE_ID_LENGTH: googleId ? googleId.length : 0,
            AUTH_GOOGLE_SECRET_EXISTS: !!process.env.AUTH_GOOGLE_SECRET,
            AUTH_GOOGLE_SECRET_LENGTH: process.env.AUTH_GOOGLE_SECRET?.length || 0,
            AUTH_GOOGLE_SECRET_STARTS_WITH: process.env.AUTH_GOOGLE_SECRET?.substring(0, 3) || "N/A",
            NEXTAUTH_URL: nextAuthUrl,
            AUTH_NAVER_ID_EXISTS: !!process.env.AUTH_NAVER_ID,
            AUTH_NAVER_ID_PREFIX: process.env.AUTH_NAVER_ID ? process.env.AUTH_NAVER_ID.substring(0, 5) + "..." : "MISSING",
            AUTH_NAVER_SECRET_EXISTS: !!process.env.AUTH_NAVER_SECRET,
        }
    });
}
