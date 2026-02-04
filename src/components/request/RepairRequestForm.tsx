'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Plus, Info, HelpCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createOrder, uploadImage } from '@/api/orders';
import { cn } from '@/lib/utils';
import { ImageSketchPopup } from './ImageSketchPopup';
import imageCompression from 'browser-image-compression';
import { useSession } from 'next-auth/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { analyzeImageCategory } from '@/utils/imageClassifier';

const COMMON_REPAIR_ITEMS = [
    { title: '단추 달기', desc: '떨어진 단추 부착 (기본/보유 단추)' },
    { title: '박음질 보강', desc: '튿어진 솔기(seam) 재박음질' },
    { title: '오염 제거', desc: '부분적인 얼룩 제거' },
    { title: '주머니 수선', desc: '주머니 추가, 삭제 및 위치 조정' },
];

const CATEGORIES = [
    {
        id: 'tops',
        label: '상의 (Tops)',
        items: '셔츠, 블라우스, 티셔츠, 맨투맨, 후드티',
        repairTypes: [
            { title: '기장 조절', desc: '소매 기장, 총장(전체 길이) 줄임/늘림' },
            { title: '부위 수선', desc: '해진 소매 끝 수선, 튿어진 옆트임 보강' },
            { title: '사이즈 조절', desc: '어깨선 수선, 품(가슴/허리) 줄임' },
        ]
    },
    {
        id: 'bottoms',
        label: '하의 (Bottoms)',
        items: '슬랙스, 청바지, 치마, 반바지',
        repairTypes: [
            { title: '폭 조절', desc: '허리/엉덩이/허벅지/밑단 폭 조절' },
            { title: '기장 수선', desc: '밑단 기장 줄임 (일반, 밑단 살리기)' },
            { title: '부자재 교체', desc: '지퍼, 단추, 훅 교체 및 보강' },
        ]
    },
    {
        id: 'suits',
        label: '정장 (Suits)',
        items: '수트 재킷, 베스트(조끼), 예복, 턱시도',
        repairTypes: [
            { title: '실루엣 보정', desc: '전체적인 핏 조정, 허리 라인' },
            { title: '구조 수선', desc: '어깨 라인, 재킷 품, 암홀 수선' },
            { title: '안감 교체', desc: '낡거나 찢어진 안감 교체' },
        ]
    },
    {
        id: 'outer',
        label: '아우터 (Outer)',
        items: '코트, 트렌치코트, 야상, 패딩, 자켓',
        repairTypes: [
            { title: '전체 수선', desc: '소매 및 총장 기장 수선' },
            { title: '부위 수선', desc: '주머니 안감, 트임(벤트) 수선' },
            { title: '부자재', desc: '단추 구멍/뿌리, 벨트 고리 수선' },
        ]
    },
    {
        id: 'leather',
        label: '가죽/모피 (Leather)',
        items: '가죽자켓, 무스탕, 모피 코트',
        repairTypes: [
            { title: '구조 수선', desc: '찢어진 가죽 접착/보강, 안감 교체' },
            { title: '부자재', desc: '가죽 전용 지퍼, 스냅 단추 수선' },
        ]
    },
];

interface ImageItem {
    id: string;
    url: string;
    sketchedUrl?: string;
    drawingUrl?: string; // Add drawingUrl to interface
    description: string;
    analysisMessage?: string;
}

export function RepairRequestForm() {
    const router = useRouter();
    const { data: session } = useSession();
    const [images, setImages] = useState<ImageItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const emptySlotCount = Math.max(1, 3 - images.length);

    const openUploadPopup = (index?: number) => {
        if (typeof index === 'number') {
            setEditingImageIndex(index);
        } else {
            setEditingImageIndex(null);
        }
        setIsPopupOpen(true);
    };

    const handlePopupConfirm = (data: { originalUrl: string; sketchedUrl: string; drawingUrl: string; description: string }) => {
        if (editingImageIndex !== null) {
            setImages((prev) => prev.map((img, i) => i === editingImageIndex ? {
                ...img,
                url: data.originalUrl,
                sketchedUrl: data.sketchedUrl,
                drawingUrl: data.drawingUrl, // Save drawingUrl
                description: data.description
            } : img));
        } else {
            setImages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    url: data.originalUrl,
                    sketchedUrl: data.sketchedUrl,
                    drawingUrl: data.drawingUrl, // Save drawingUrl
                    description: data.description,
                    analysisMessage: undefined
                }
            ]);
        }
        setIsPopupOpen(false);
        setEditingImageIndex(null);
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const updateImageDescription = (index: number, text: string) => {
        setImages(prev => prev.map((img, i) => i === index ? { ...img, description: text } : img));
    };

    // Helper to update analysis message
    const updateImageAnalysisResult = (index: number, message: string) => {
        setImages(prev => prev.map((img, i) => i === index ? { ...img, analysisMessage: message } : img));
    };

    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        const analyzeLastImage = async () => {
            // Analyze the last added image if it doesn't have a message yet
            const lastIndex = images.length - 1;
            if (lastIndex >= 0 && !images[lastIndex].analysisMessage && !isAnalyzing) {
                const lastImage = images[lastIndex];

                try {
                    setIsAnalyzing(true);
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    // Use ORIGINAL URL for AI analysis as requested
                    img.src = lastImage.url;

                    img.onload = async () => {
                        const result = await analyzeImageCategory(img);

                        // User requested high accuracy only. Threshold: 50% (0.5)
                        if (result) {
                            console.log(`AI Prediction: ${result.label} (${(result.probability * 100).toFixed(1)}%)`);

                            if (result.probability >= 0.5) {
                                const matchedCategory = CATEGORIES.find(c => c.id === result.categoryId);
                                if (matchedCategory) {
                                    // 1. Auto-select category if not selected
                                    if (!selectedCategory) {
                                        setSelectedCategory(result.categoryId);
                                    }

                                    // 2. Generate Message
                                    let message = `업로드 된 이미지는 ${result.labelKo}(으)로 분석 됩니다.`;
                                    if (result.labelKo !== matchedCategory.label.split(' ')[0]) {
                                        message = `올리신 사진은 ${result.labelKo}(으)로 보입니다. 의상을 ${matchedCategory.label.split(' ')[0]}(으)로 선택 하였습니다.`;
                                    }

                                    updateImageAnalysisResult(lastIndex, message);
                                }
                            } else {
                                console.log("AI confidence too low to suggest category.");
                            }
                        }
                        setIsAnalyzing(false);
                    };

                    img.onerror = () => setIsAnalyzing(false);

                } catch (e) {
                    console.error("AI Analysis failed", e);
                    setIsAnalyzing(false);
                }
            }
        };

        analyzeLastImage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [images.length]);

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = 0;
        }
    }, [images.length]);

    const getFileFromUrl = async (url: string, name: string): Promise<File> => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], name, { type: blob.type });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (images.length === 0 || !selectedCategory) {
            alert('최소 1장의 사진과 수선 종류를 선택해주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            const uploadedImages = await Promise.all(images.map(async (img, index) => {
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };

                let originalUrl = img.url;
                if (img.url.startsWith('blob:') || img.url.startsWith('data:')) {
                    const originalFile = await getFileFromUrl(img.url, `image-${index}.jpg`);
                    const compressedFile = await imageCompression(originalFile, options);
                    originalUrl = await uploadImage(compressedFile);
                }

                let sketchedUrl = img.sketchedUrl;
                if (img.sketchedUrl && (img.sketchedUrl.startsWith('blob:') || img.sketchedUrl.startsWith('data:'))) {
                    const sketchFile = await getFileFromUrl(img.sketchedUrl, `sketch-${index}.png`);
                    const compressedSketch = await imageCompression(sketchFile, options);
                    sketchedUrl = await uploadImage(compressedSketch);
                }

                return {
                    url: originalUrl,
                    sketchedUrl: sketchedUrl,
                    description: img.description
                };
            }));

            // Determine Title with Color
            let titlePrefix = "";
            if (uploadedImages.length > 0) {
                // Try to get dominant color from the first image
                try {
                    const firstImg = new Image();
                    // Only set crossOrigin for remote URLs to avoid CORS errors on local Blobs
                    if (uploadedImages[0].url.startsWith('http') || uploadedImages[0].url.startsWith('https')) {
                        firstImg.crossOrigin = "anonymous";
                    }
                    firstImg.src = uploadedImages[0].url;
                    await new Promise((resolve, reject) => {
                        firstImg.onload = resolve;
                        firstImg.onerror = (e) => {
                            console.error("Image load failed details:", e);
                            reject(new Error("Image failed to load"));
                        };
                    });

                    const { getDominantColor } = await import('@/utils/colorUtils');
                    const color = getDominantColor(firstImg);
                    if (color) {
                        titlePrefix = color;
                    }
                } catch (e) {
                    console.error("Color extraction failed", e);
                }
            }

            const categoryLabel = selectedCategoryData?.label.split(' ')[0] || "의류"; // Get main label (e.g. "상의", "하의")
            const orderTitle = titlePrefix ? `${titlePrefix} ${categoryLabel} 수선` : undefined;

            await createOrder({
                title: orderTitle,
                images: uploadedImages,
                category: selectedCategory,
                description,
                userEmail: session?.user?.email || undefined,
                userName: session?.user?.name || undefined,
                userImage: session?.user?.image || undefined,
            });
            router.push('/orders');
        } catch (error) {
            console.error(error);
            alert('주문 접수에 실패했습니다. ' + error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedCategoryData = CATEGORIES.find(c => c.id === selectedCategory);

    return (
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 w-full max-w-xl mx-auto relative z-10 transition-all duration-300">
            <h2 className="text-lg md:text-2xl font-bold text-slate-900 mb-6 text-center">수선 견적 요청</h2>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Image Upload Section (Moved to Top) */}
                <div className="space-y-3">
                    <label className="text-[13px] md:text-sm font-semibold text-slate-700 block">
                        사진 및 요청사항 <span className="text-blue-500 font-normal ml-1">({images.length}장)</span>
                    </label>

                    <div
                        ref={scrollContainerRef}
                        className="flex gap-4 overflow-x-auto pb-4 snap-x -mx-2 px-2 items-start"
                        style={{ scrollbarWidth: 'thin' }}
                    >
                        {images.map((img, idx) => (
                            <div key={img.id} className="flex-none w-48 snap-start">
                                <div className="space-y-2 group">
                                    <div className="relative w-full h-64 transition-transform duration-200 hover:scale-[1.02]">
                                        <ImageSlot
                                            image={img.sketchedUrl || img.url}
                                            onRemove={() => removeImage(idx)}
                                            onClick={() => openUploadPopup(idx)}
                                            label={`사진 ${idx + 1}`}
                                            message={img.analysisMessage}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="설명 작성 (예: 찢어진 부위)"
                                        value={img.description}
                                        onChange={(e) => updateImageDescription(idx, e.target.value)}
                                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50 transition-all font-medium placeholder:text-slate-400 mt-2"
                                    />
                                </div>
                            </div>
                        ))}

                        {Array.from({ length: emptySlotCount }).map((_, i) => (
                            <div key={`empty-${i}`} className="flex-none w-28 h-40 snap-start">
                                <ImageSlot
                                    image={null}
                                    onClick={openUploadPopup}
                                    label={images.length === 0 && i === 0 ? "전체/앞면" : "추가 촬영"}
                                />
                            </div>
                        ))}
                    </div>
                    {images.length > 0 && (
                        <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                            <Info className="w-3 h-3" />
                            <span>사진 아래에 설명을 적을 수 있습니다</span>
                        </p>
                    )}
                </div>

                {/* 2. Category Selection Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-[13px] md:text-sm font-semibold text-slate-700 block">수선 종류 선택</label>

                        {/* Guide Popup Trigger */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <button type="button" className="text-[11px] md:text-xs flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors px-2 py-1 rounded-full hover:bg-blue-50">
                                    <HelpCircle className="w-3.5 h-3.5" />
                                    <span>수선 가이드 보기</span>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md w-[90%] rounded-2xl p-0 overflow-hidden bg-white">
                                <DialogHeader className="p-4 bg-slate-50 border-b border-slate-100">
                                    <DialogTitle className="text-base md:text-lg font-bold text-slate-800">
                                        {selectedCategoryData ? `${selectedCategoryData.label} 가이드` : '전체 수선 가이드'}
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="p-5 max-h-[60vh] overflow-y-auto">
                                    {selectedCategoryData ? (
                                        <div className="flex flex-col gap-5">
                                            <div>
                                                <span className="font-bold text-blue-600 text-xs md:text-sm mb-2 block px-2 py-1 bg-blue-50 rounded-lg w-fit">대상 품목</span>
                                                <p className="text-slate-700 text-sm pl-1">{selectedCategoryData.items}</p>
                                            </div>

                                            <div>
                                                <span className="font-bold text-blue-600 text-xs md:text-sm mb-2 block px-2 py-1 bg-blue-50 rounded-lg w-fit">주요 수선 항목</span>
                                                <ul className="space-y-2 pl-1">
                                                    {selectedCategoryData.repairTypes.map((type, idx) => (
                                                        <li key={idx} className="text-sm">
                                                            <span className="font-semibold text-slate-800 block mb-0.5">• {type.title}</span>
                                                            <span className="text-slate-500 text-xs block leading-relaxed">{type.desc}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-slate-500">
                                            <p className="mb-2">수선 종류를 선택하시면</p>
                                            <p>해당 품목의 상세 가이드를 볼 수 있습니다.</p>
                                        </div>
                                    )}

                                    <div className="mt-6 pt-5 border-t border-slate-100">
                                        <span className="font-bold text-slate-500 text-xs block mb-2">💡 모든 품목 공통 수선</span>
                                        <div className="flex flex-wrap gap-2">
                                            {COMMON_REPAIR_ITEMS.map((item, idx) => (
                                                <span key={idx} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                                                    {item.title}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategory(cat.id)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-[13px] md:text-sm font-medium transition-all duration-200 border",
                                    selectedCategory === cat.id
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                )}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Description Section */}
                <div className="space-y-3">
                    <label className="text-[13px] md:text-sm font-semibold text-slate-700 block">추가 요청 사항 (선택)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="배송시 요청사항이나 기타 특이사항이 있다면 적어주세요..."
                        className="w-full h-20 p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-slate-50 text-[13px] md:text-sm transition-all"
                    />
                </div>

                <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-sm md:text-base font-bold bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    isLoading={isSubmitting}
                >
                    견적 요청하기
                </Button>
            </form>

            <ImageSketchPopup
                isOpen={isPopupOpen}
                onClose={() => { setIsPopupOpen(false); setEditingImageIndex(null); }}
                onConfirm={handlePopupConfirm}
                initialData={editingImageIndex !== null ? {
                    originalUrl: images[editingImageIndex].url,
                    sketchedUrl: images[editingImageIndex].sketchedUrl || null,
                    drawingUrl: images[editingImageIndex].drawingUrl || null, // Pass drawingUrl
                    description: images[editingImageIndex].description
                } : null}
            />
        </div>
    );
}

function ImageSlot({ label, image, message, onClick, onRemove }: { label: string; image: string | null; message?: string; onClick?: () => void; onRemove?: () => void }) {
    return (
        <div className="relative w-full h-full">
            {image ? (
                <div
                    onClick={onClick}
                    className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm group bg-white cursor-pointer"
                >
                    <img
                        src={image}
                        alt={label}
                        className="w-full h-full"
                        style={{ objectFit: 'cover' }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    </div>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors backdrop-blur-sm z-10"
                    >
                        <X className="h-3 w-3" />
                    </button>

                    <div className={`absolute bottom-0 left-0 w-full p-3 pt-12 pointer-events-none rounded-b-2xl transition-all duration-500 ${message ? 'bg-gradient-to-t from-black/90 via-black/70 to-transparent' : 'bg-gradient-to-t from-black/60 to-transparent'}`}>
                        {message ? (
                            <div className="text-left animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-1.5 mb-1 opacity-100">
                                    <div className="bg-blue-500/20 p-1 rounded-full backdrop-blur-sm border border-blue-400/30">
                                        <Sparkles className="w-2.5 h-2.5 text-blue-300 fill-blue-300" />
                                    </div>
                                    <span className="text-blue-300 font-bold text-[10px] tracking-wide">AI 분석 완료</span>
                                </div>
                                <p className="text-white/95 text-[11px] md:text-xs font-medium leading-relaxed drop-shadow-md break-keep">
                                    {message}
                                </p>
                            </div>
                        ) : (
                            <span className="text-[10px] text-white font-medium block text-center truncate shadow-sm opacity-90">{label}</span>
                        )}
                    </div>
                </div>
            ) : (
                <div onClick={onClick} className="flex flex-col items-center justify-center w-full h-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300 cursor-pointer transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors shadow-sm">
                        <Plus className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium group-hover:text-blue-600 transition-colors text-center px-1">{label}</span>
                </div>
            )}
        </div>
    );
}
