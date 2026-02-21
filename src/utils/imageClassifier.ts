import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

let model: mobilenet.MobileNet | null = null;

// Mapping MobileNet classes to our Categories
// MobileNet classes are English specific (e.g. 'jean', 'sweatshirt')
const CATEGORY_MAPPING: Record<string, string> = {
    // Tops
    'jersey': 'tops',
    't-shirt': 'tops',
    'sweatshirt': 'tops',
    'shirt': 'tops',
    'blouse': 'tops',
    'velvet': 'tops',

    // Bottoms
    'jean': 'bottoms',
    'blue jean': 'bottoms',
    'miniskirt': 'bottoms',
    'overskirt': 'bottoms',
    'sarong': 'bottoms',
    'pajama': 'bottoms',
    'swimming trunks': 'bottoms',

    // Suits/Outer
    'suit': 'suits_outer',
    'tuxedo': 'suits_outer',
    'bow tie': 'suits_outer',
    'groom': 'suits_outer',
    'trench coat': 'suits_outer',
    'coat': 'suits_outer',
    'fur coat': 'leather',
    'poncho': 'suits_outer',
    'cloak': 'suits_outer',
    'cardigan': 'suits_outer',

    // Padding/Winter Coats
    'puffer': 'padding',
    'down jacket': 'padding',

    // Dress
    'gown': 'dress',
    'dress': 'dress',

    // Leather
    // 'fur coat' -> leather
    // MobileNet doesn't strictly distinguish material, but 'fur coat' is close.
    'bulletproof vest': 'leather', // Common misclassification for leather vests/jackets
    'holster': 'leather',
    'breastplate': 'leather',
    'cuirass': 'leather',
    'cowboy boot': 'leather',

    // Generic
    'jacket': 'suits_outer',
    'bomber': 'suits_outer',
    'mail': 'tops', // chain mail often confused with knits
};

export async function loadModel() {
    if (!model) {
        console.log("Loading MobileNet model...");
        // Ensure backend is ready (webgl usually)
        await tf.ready();
        model = await mobilenet.load({ version: 2, alpha: 1.0 });
        console.log("MobileNet model loaded.");
    }
    return model;
}

// Korean translation map for MobileNet classes
const LABEL_TO_KO: Record<string, string> = {
    'jersey': '저지',
    't-shirt': '티셔츠',
    'sweatshirt': '맨투맨',
    'shirt': '셔츠',
    'blouse': '블라우스',
    'velvet': '벨벳',
    'jean': '청바지',
    'blue jean': '청바지',
    'miniskirt': '미니스커트',
    'overskirt': '오버스커트',
    'sarong': '사롱',
    'pajama': '파자마',
    'swimming trunks': '수영복',
    'suit': '수트',
    'tuxedo': '턱시도',
    'bow tie': '보타이',
    'groom': '예복',
    'trench coat': '트렌치코트',
    'coat': '코트',
    'fur coat': '퍼 코트',
    'poncho': '판초',
    'cloak': '망토',
    'cardigan': '가디건',
    'puffer': '패딩',
    'bulletproof vest': '가죽 자켓(유사)', // Friendly name for user
    'holster': '가죽 제품',
    'breastplate': '가죽 의류',
    'cuirass': '가죽 의류',
    'cowboy boot': '가죽 부츠',
    'jacket': '자켓',
    'bomber': '봄버 자켓',
    'mail': '니트/메쉬',
    'down jacket': '패딩',
    'gown': '원피스',
    'dress': '원피스'
};

// Priority for conflict resolution
const PRIORITY_MAP: Record<string, number> = {
    'leather': 10,
    'padding': 7,
    'dress': 6,
    'suits_outer': 5,
    'tops': 1,
    'bottoms': 1
};

export async function analyzeImageCategory(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<{ categoryId: string, label: string, probability: number, labelKo: string } | null> {
    try {
        const net = await loadModel();
        if (!net) return null;

        // Get Top 5 candidates to find better matches
        const predictions = await net.classify(imageElement, 5);
        console.log('AI Predictions:', predictions);

        let bestMatch: { categoryId: string, label: string, probability: number, labelKo: string } | null = null;

        for (const pred of predictions) {
            const classNames = pred.className.toLowerCase().split(', ');
            for (const name of classNames) {
                let categoryId: string | null = null;
                let labelKo = LABEL_TO_KO[name] || name;

                // Exact match or keyword inclusion
                if (CATEGORY_MAPPING[name]) {
                    categoryId = CATEGORY_MAPPING[name];
                } else {
                    // Partial check
                    for (const key in CATEGORY_MAPPING) {
                        if (name.includes(key)) {
                            categoryId = CATEGORY_MAPPING[key];
                            labelKo = LABEL_TO_KO[key] || name;
                            break;
                        }
                    }
                }

                if (categoryId) {
                    const currentMatch = {
                        categoryId,
                        label: name,
                        labelKo,
                        probability: pred.probability
                    };

                    // If we already have a match, compare priorities
                    if (bestMatch) {
                        const currentPriority = PRIORITY_MAP[categoryId] || 0;
                        const bestPriority = PRIORITY_MAP[bestMatch.categoryId] || 0;

                        // Heuristic: If we found "Leather" (High Priority) even with lower probability (but meaningful, > 0.05), take it.
                        // Or if priorities are equal, stick with higher probability (first one).
                        if (currentPriority > bestPriority && pred.probability > 0.05) {
                            bestMatch = currentMatch;
                        }
                    } else {
                        bestMatch = currentMatch;
                    }
                }
            }
        }
        return bestMatch;

    } catch (error) {
        console.error("Image classification failed", error);
    }
    return null;
}
