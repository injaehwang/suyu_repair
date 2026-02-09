import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Prevent caching of proxy responses

export async function GET(request: NextRequest, { params }: { params: Promise<{ proxy: string[] }> }) {
    return handleProxy(request, await params);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ proxy: string[] }> }) {
    return handleProxy(request, await params);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ proxy: string[] }> }) {
    return handleProxy(request, await params);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ proxy: string[] }> }) {
    return handleProxy(request, await params);
}

async function handleProxy(request: NextRequest, params: { proxy: string[] }) {
    // Skip proxying for NextAuth routes only
    const firstSegment = params.proxy[0];
    if (firstSegment === 'auth') {
        return NextResponse.json(
            { error: 'Route Not Found', message: 'Auth routes have dedicated handlers' },
            { status: 404 }
        );
    }

    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
        return NextResponse.json(
            { error: 'Configuration Error', message: 'BACKEND_URL is not defined on server.' },
            { status: 500 }
        );
    }

    const path = params.proxy.join('/');
    const queryString = request.nextUrl.search;
    const targetUrl = `${backendUrl}/${path}${queryString}`;

    console.log(`[Proxy] Forwarding ${request.method} to: ${targetUrl}`);

    try {
        // 1. Prepare Headers (Filter problematic ones)
        const reqHeaders = new Headers(request.headers);
        reqHeaders.delete('host');
        reqHeaders.delete('connection');
        reqHeaders.delete('content-length'); // Let fetch calculate it

        // 2. Prepare Body (Streaming)
        const body = (request.method !== 'GET' && request.method !== 'HEAD')
            ? request.body
            : undefined;

        // 3. Fetch Options
        const fetchOptions: RequestInit = {
            method: request.method,
            headers: reqHeaders,
            body,
            // @ts-ignore
            duplex: (body ? 'half' : undefined) // Only set duplex if body exists
        };

        const response = await fetch(targetUrl, fetchOptions);

        // 4. Prepare Response Headers (Strip for Next.js compatibility)
        const resHeaders = new Headers(response.headers);
        resHeaders.delete('content-encoding'); // Let Next.js handle compression
        resHeaders.delete('content-length');   // Let Next.js recalculate
        resHeaders.delete('transfer-encoding');

        // 5. Return Response
        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: resHeaders
        });

    } catch (error: any) {
        console.error('[Proxy] Error:', error);
        return NextResponse.json(
            {
                error: 'Proxy Error',
                message: error.message,
                stack: error.stack,
                targetUrl
            },
            { status: 500 }
        );
    }
}
