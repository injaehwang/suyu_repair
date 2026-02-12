import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
    try {
        const url = `${BACKEND_URL}/announcements/active`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch active announcements' },
                { status: response.status }
            );
        }

        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching active announcements:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
