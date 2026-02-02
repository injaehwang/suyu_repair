'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Plus, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createOrder } from '@/api/orders';
import { cn } from '@/lib/utils';
import { ImageSketchPopup } from './ImageSketchPopup';

const CATEGORIES = [
    {
        id: 'tops',
        label: '상의 (Tops)',
        items: '셔츠, 블라우스, 티셔츠',
        points: '칼라(깃)와 소매 끝 찌든 때 제거, 정밀 다림질'
    },
    {
        id: 'bottoms',
        label: '하의 (Bottoms)',
        items: '슬랙스, 면바지, 청바지, 치마',
        points: '칼주름 복원, 원단 수축 방지 관리'
    },
    {
        id: 'suits',
        label: '슈트 (Suits)',
        items: '정장 재킷, 베스트, 예복',
        points: '형태 보존 드라이클리닝, 어깨 라인 유지'
    },
    {
        id: 'knitwear',
        label: '니트 (Knitwear)',
        items: '가디건, 스웨터, 캐시미어',
        points: '보풀 제거(Pilling care), 섬유 유연 및 형태 복원'
    },
    {
        id: 'outer',
        label: '아우터 (Outer)',
        items: '코트, 트렌치코트, 자켓',
        points: '원단별 특수 세정, 광택 및 질감 살리기'
    },
];

interface ImageItem {
    id: string;
    url: string; // The original URL if needed, or sketched one for display
    sketchedUrl?: string; // Add sketched URL
    description: string;
}

export function RepairRequestForm() {
    const router = useRouter();
    const [images, setImages] = useState<ImageItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Initial Empty Slots Logic
    // We want to visually hint at least 3 slots availability
    const emptySlotCount = Math.max(1, 3 - images.length);

    // This function is no longer directly used for file input change, 
    // but rather we open the popup.
    const openUploadPopup = (index?: number) => {
        if (typeof index === 'number') {
            setEditingImageIndex(index);
        } else {
            setEditingImageIndex(null);
        }
        setIsPopupOpen(true);
    };

    const handlePopupConfirm = (data: { originalUrl: string; sketchedUrl: string; description: string }) => {
        if (editingImageIndex !== null) {
            setImages((prev) => prev.map((img, i) => i === editingImageIndex ? {
                ...img,
                url: data.originalUrl,
                sketchedUrl: data.sketchedUrl,
                description: data.description
            } : img));
        } else {
            setImages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    url: data.originalUrl,
                    sketchedUrl: data.sketchedUrl,
                    description: data.description
                }
            ]);
        }
        setIsPopupOpen(false);
        setEditingImageIndex(null);
    };

    const removeImage = (index: number) => {
        // Technically we should revoke URLs to avoid memory leaks if they are blob URLs
        // URL.revokeObjectURL(images[index].url);
        // if (images[index].sketchedUrl) URL.revokeObjectURL(images[index].sketchedUrl);
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const updateImageDescription = (index: number, text: string) => {
        setImages(prev => prev.map((img, i) => i === index ? { ...img, description: text } : img));
    };

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
    }, [images.length]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (images.length === 0 || !selectedCategory) {
            alert('최소 1장의 사진과 수선 종류를 선택해주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Pass sketchedUrl as the main image or handle both in backend
            // usage: image.sketchedUrl || image.url
            await createOrder({ images, selectedCategory, description });
            router.push('/orders');
        } catch (error) {
            alert('주문 접수에 실패했습니다.' + error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedCategoryData = CATEGORIES.find(c => c.id === selectedCategory);

    return (
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 w-full max-w-xl mx-auto relative z-10 transition-all duration-300">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 text-center">수선 견적 요청</h2>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Category Selection */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 block">수선 종류 선택</label>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategory(cat.id)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                                    selectedCategory === cat.id
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                )}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                    {selectedCategoryData && (
                        <div className="mt-4 p-4 bg-blue-50/60 rounded-2xl border border-blue-100 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="mb-2">
                                <span className="font-bold text-blue-700 mr-2">대상 품목:</span>
                                <span className="text-slate-700">{selectedCategoryData.items}</span>
                            </div>
                            <div>
                                <span className="font-bold text-blue-700 mr-2">관리 포인트:</span>
                                <span className="text-slate-700 leading-relaxed">{selectedCategoryData.points}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Upload Photos with Description */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 block">
                        사진 및 요청사항 <span className="text-blue-500 font-normal ml-1">({images.length}장)</span>
                    </label>

                    <div
                        ref={scrollContainerRef}
                        className="flex gap-4 overflow-x-auto pb-4 snap-x -mx-2 px-2 items-start"
                        style={{ scrollbarWidth: 'thin' }} // Optional: Firefox 'thin' -> native auto on others
                    >
                        {/* Render Filled Slots */}
                        {images.map((img, idx) => (
                            <div key={img.id} className="flex-none w-48 snap-start">
                                <div className="space-y-2 group">
                                    <div className="relative w-full h-64 transition-transform duration-200 hover:scale-[1.02]">
                                        <ImageSlot
                                            image={img.sketchedUrl || img.url}
                                            onRemove={() => removeImage(idx)}
                                            onClick={() => openUploadPopup(idx)}
                                            label={`사진 ${idx + 1}`}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="설명 작성 (예: 찢어진 부위)"
                                        value={img.description}
                                        onChange={(e) => updateImageDescription(idx, e.target.value)}
                                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50 transition-all font-medium placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Render Empty Slots */}
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

                {/* Global Instructions */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 block">추가 요청 사항 (선택)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="배송시 요청사항이나 기타 특이사항이 있다면 적어주세요..."
                        className="w-full h-20 p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-slate-50 text-sm transition-all"
                    />
                </div>

                <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-base font-bold bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
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
                    description: images[editingImageIndex].description
                } : null}
            />
        </div>
    );
}

function ImageSlot({ label, image, onClick, onRemove }: { label: string; image: string | null; onClick?: () => void; onRemove?: () => void }) {
    return (
        <div className="relative w-full h-full">
            {image ? (
                <div
                    onClick={onClick}
                    className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm group bg-white cursor-pointer"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={image}
                        alt={label}
                        className="w-full h-full"
                        style={{ objectFit: 'cover' }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        {/* Optional: Edit Icon on hover */}
                    </div>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors backdrop-blur-sm z-10"
                    >
                        <X className="h-3 w-3" />
                    </button>
                    {/* Label Overlay */}
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-2 pt-4 pointer-events-none">
                        <span className="text-[10px] text-white font-medium block text-center truncate shadow-sm">{label}</span>
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
