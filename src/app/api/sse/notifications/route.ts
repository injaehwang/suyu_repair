import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = `${BACKEND_URL}/sse/notifications?${searchParams.toString()}`;

    console.log('[SSE Proxy] Connecting to:', url);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

        // Return the SSE stream directly
        return new Response(response.body, {
            status: response.status,
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error: any) {
        console.error('[SSE Proxy] Error:', error);
        return new Response(
            JSON.stringify({ error: 'SSE Proxy Error', message: error.message }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
