import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#2563eb',
                    borderRadius: '22%',
                }}
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="6" cy="6" r="3" />
                    <path d="M8.12 8.12 12 12" />
                    <path d="M20 4 8.12 15.88" />
                    <circle cx="6" cy="18" r="3" />
                    <path d="M14.8 14.8 20 20" />
                </svg>
            </div>
        ),
        { ...size }
    );
}
