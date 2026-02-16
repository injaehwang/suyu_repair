'use client';

import Script from 'next/script';

export default function AientrophyScript() {
    return (
        <>
            <Script
                id="aientrophy-config"
                strategy="beforeInteractive"
                dangerouslySetInnerHTML={{
                    __html: `window.SecuritySDKConfig = {
                        endpoint: "https://api.aientrophy.com/api/v1/events",
                        clientKey: "ae3a5e1c-c07d-419c-b275-086d466158a4",
                        debug: false
                    };`
                }}
            />
            <Script
                src="https://dqf159255eu1e.cloudfront.net/sdk/latest/aientrophy.min.js"
                strategy="afterInteractive"
            />
        </>
    );
}