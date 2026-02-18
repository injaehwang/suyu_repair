"use client";

import { useEffect } from "react";

export default function AientrophyInit() {
    useEffect(() => {
        const initSDK = async () => {
            const { Aientrophy } = await import("@aientrophy/sdk");
            const ai = new Aientrophy({
                clientKey: "ae3a5e1c-c07d-419c-b275-086d466158a4",
            });
            ai.protect();
        };
        initSDK();
    }, []);

    return null;
}
