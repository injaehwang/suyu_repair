interface AientrophyOptions {
    clientKey: string;
}

declare class Aientrophy {
    constructor(options: AientrophyOptions);
}

interface Window {
    aientrophy: Aientrophy;
    Aientrophy: typeof Aientrophy;
}

declare var Aientrophy: typeof Aientrophy;
