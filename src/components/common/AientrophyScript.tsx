'use client';

import Script from 'next/script';

export default function AientrophyScript() {
    return (
        <Script
            src="https://dqf159255eu1e.cloudfront.net/sdk/latest/aientrophy.min.js"
            strategy="lazyOnload"
            onLoad={() => {
                if (typeof window !== 'undefined' && window.Aientrophy) {
                    window.aientrophy = new window.Aientrophy({
                        clientKey: 'ae3a5e1c-c07d-419c-b275-086d466158a4',
                    });
                }
            }}
        />
    );
}
