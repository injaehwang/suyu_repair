
// Basic color palette for mapping
const BASIC_COLORS: { name: string; rgb: [number, number, number] }[] = [
    { name: '검정', rgb: [0, 0, 0] },
    { name: '흰색', rgb: [255, 255, 255] },
    { name: '회색', rgb: [128, 128, 128] },
    { name: '네이비', rgb: [0, 0, 128] },
    { name: '베이지', rgb: [245, 245, 220] },
    { name: '브라운', rgb: [165, 42, 42] },
    { name: '빨강', rgb: [255, 0, 0] },
    { name: '파랑', rgb: [0, 0, 255] },
    { name: '초록', rgb: [0, 128, 0] },
    { name: '노랑', rgb: [255, 255, 0] },
    { name: '핑크', rgb: [255, 192, 203] },
    { name: '보라', rgb: [128, 0, 128] },
    { name: '주황', rgb: [255, 165, 0] },
    { name: '하늘', rgb: [135, 206, 235] },
    { name: '카키', rgb: [240, 230, 140] }, // Approximate
];

// Helper to calculate Euclidean distance between two colors
function colorDistance(rgb1: [number, number, number], rgb2: [number, number, number]): number {
    return Math.sqrt(
        Math.pow(rgb1[0] - rgb2[0], 2) +
        Math.pow(rgb1[1] - rgb2[1], 2) +
        Math.pow(rgb1[2] - rgb2[2], 2)
    );
}

export function getDominantColor(imageElement: HTMLImageElement): string | null {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Downscale for performance
        canvas.width = 100;
        canvas.height = 100;

        ctx.drawImage(imageElement, 0, 0, 100, 100);

        const imageData = ctx.getImageData(0, 0, 100, 100).data;
        let r = 0, g = 0, b = 0;
        let count = 0;

        for (let i = 0; i < imageData.length; i += 4) {
            // Simple average for now (can be improved with clustering/quantization later)
            r += imageData[i];
            g += imageData[i + 1];
            b += imageData[i + 2];
            count++;
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        // Find closest basic color
        let closestColor = BASIC_COLORS[0];
        let minDist = Infinity;

        for (const color of BASIC_COLORS) {
            const dist = colorDistance([r, g, b], color.rgb);
            if (dist < minDist) {
                minDist = dist;
                closestColor = color;
            }
        }

        return closestColor.name;

    } catch (e) {
        console.error("Failed to extract color", e);
        return null;
    }
}
