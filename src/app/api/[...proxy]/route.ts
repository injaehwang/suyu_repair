import { NextRequest, NextResponse } from 'next/server';

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
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
        return NextResponse.json(
            { error: 'Configuration Error', message: 'BACKEND_URL is not defined on server.' },
            { status: 500 }
        );
    }

    // Reconstruct path: /api/orders/123 -> /orders/123
    // params.proxy is ['orders', '123']
    const path = params.proxy.join('/');
    const queryString = request.nextUrl.search; // includes ?
    const targetUrl = `${backendUrl}/${path}${queryString}`;

    console.log(`[Proxy] Forwarding ${request.method} to: ${targetUrl}`);

    try {
        // Forward headers
        const headers = new Headers(request.headers);
        headers.delete('host'); // Avoid host mismatch
        headers.delete('connection');

        // Copy body for non-GET/HEAD
        const body = (request.method !== 'GET' && request.method !== 'HEAD')
            ? await request.blob()
            : undefined;

        const response = await fetch(targetUrl, {
            method: request.method,
            headers,
            body,
            // @ts-ignore
            duplex: 'half' // required for streaming bodies in some node versions
        });

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        });

    } catch (error: any) {
        console.error('[Proxy] Error:', error);
        return NextResponse.json(
            { error: 'Proxy Error', message: error.message },
            { status: 500 }
        );
    }
}
