declare module '@aientrophy/sdk' {
    interface CrawlProtectConfig {
        protectSelectors?: string[];
        insertHoneypot?: boolean;
    }

    interface AientropyConfig {
        clientKey: string;
        endpoint?: string;
        debug?: boolean;
        crawlProtect?: CrawlProtectConfig;
        callbacks?: Record<string, (...args: any[]) => void>;
        serverConfig?: Record<string, any>;
    }

    export class Aientrophy {
        constructor(config: AientropyConfig);
        protect(): void;
        on(event: string, handler: (...args: any[]) => void): void;
    }
}

interface Window {
    aientrophy: import('@aientrophy/sdk').Aientrophy;
    Aientrophy: typeof import('@aientrophy/sdk').Aientrophy;
}
