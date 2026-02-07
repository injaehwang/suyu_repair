import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path'); // e.g., /orders
    const query = searchParams.toString().replace(`path=${path}&`, '').replace(`path=${path}`, ''); // simplistic query forwarding

    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
        return NextResponse.json({ error: 'BACKEND_URL is not defined' }, { status: 500 });
    }

    const targetUrl = `${backendUrl}${path}?${query}`;
    console.log(`[DebugProxy] Fetching: ${targetUrl}`);

    try {
        const res = await fetch(targetUrl);
        const contentType = res.headers.get('content-type');
        const text = await res.text();

        return NextResponse.json({
            targetUrl,
            status: res.status,
            headers: Object.fromEntries(res.headers.entries()),
            body: text.substring(0, 1000) // Preview
        });
    } catch (error: any) {
        return NextResponse.json({
            targetUrl,
            error: 'Fetch Failed',
            message: error.message,
            cause: error.cause,
            stack: error.stack
        }, { status: 500 });
    }
}
