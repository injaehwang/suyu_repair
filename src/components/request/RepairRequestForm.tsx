'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LoginModal } from '@/components/auth/LoginModal';
import { X, Plus, Info, HelpCircle, Sparkles, Shirt, Trash2, CheckCircle2, Loader2, PenTool, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createOrder, uploadImage } from '@/api/orders';
import { cn } from '@/lib/utils';
import { ImageSketchPopup } from './ImageSketchPopup';
import imageCompression from 'browser-image-compression';
import { useAlert } from '@/components/providers/global-alert-provider';

import { analyzeImageCategory } from '@/utils/imageClassifier';

// ==========================================
// 1. Define Repair Option Types & Specs
// ==========================================

type RepairSpecType = 'range' | 'select' | 'checkbox_group';

interface RepairSpec {
    id: string;
    label: string;
    type: RepairSpecType;
    min?: number;
    max?: number;
    unit?: string;
    allowMore?: boolean;
    excludes?: string[];
    options?: string[];
    photoRequired?: boolean;
    photoGuide?: string;
}

const REPAIR_SPECS: Record<string, RepairSpec> = {
    length_reduction: {
        id: 'length_reduction',
        label: '기장 줄이기',
        type: 'range',
        min: 1,
        max: 10,
        unit: 'cm',
        allowMore: true,
        options: ['소매', '총장'],
        excludes: ['length_extension']
    },
    length_extension: {
        id: 'length_extension',
        label: '기장 늘리기',
        type: 'range',
        min: 1,
        max: 2,
        unit: 'cm',
        photoGuide: '늘리기 수선은 안감이 있어야 가능합니다.',
        options: ['소매', '총장'],
        excludes: ['length_reduction']
    },
    width_reduction: {
        id: 'width_reduction',
        label: '폭 줄이기',
        type: 'range',
        min: 1,
        max: 5,
        unit: 'cm',
        allowMore: true,
        excludes: ['width_extension'] // Prepared for future
    },
    // Hypothetical Width Extension if added later
    width_extension: {
        id: 'width_extension',
        label: '폭 늘리기',
        type: 'range',
        min: 1,
        max: 5,
        unit: 'cm',
        excludes: ['width_reduction']
    },
    subsidiary: {
        id: 'subsidiary',
        label: '부자재 교체',
        type: 'checkbox_group',
        options: ['고장난 지퍼 교체', '단추/훅 교체 및 보강', '그외 단추 수선']
    },
    subsidiary_bottom: {
        id: 'subsidiary_bottom',
        label: '부자재/기타',
        type: 'checkbox_group',
        options: ['지퍼', '단추', '기타']
    },
    subsidiary_suit: {
        id: 'subsidiary_suit',
        label: '부자재/기타',
        type: 'checkbox_group',
        options: ['주머니 수선', '안감 교체', '기타']
    },
    structure_top: {
        id: 'structure_top',
        label: '구조/기타 수선',
        type: 'checkbox_group',
        options: ['설명란 기재']
    },
    structure: {
        id: 'structure',
        label: '구조 수선',
        type: 'checkbox_group',
        options: ['지퍼, 단추 수선', '주머니 수선/추가/이동', '품 조절', '안감 교체']
    },
    inquiry_only: {
        id: 'inquiry_only',
        label: '문의사항',
        type: 'checkbox_group',
        options: ['상담 요청']
    },
    subsidiary_leather: {
        id: 'subsidiary_leather',
        label: '부자재 교체',
        type: 'checkbox_group',
        options: ['지퍼 수선', '안감 교체', '기타']
    }
};

const CATEGORIES = [
    {
        id: 'tops',
        label: '상의, 블라우스',
        items: '셔츠, 블라우스, 티셔츠, 맨투맨, 후드티',
        repairTypes: [
            { specId: 'length_reduction', title: '기장 줄이기', desc: '소매, 총장 줄임' },
            { specId: 'length_extension', title: '기장 늘리기', desc: '소매, 총장 늘림' },
            { specId: 'width_reduction', title: '사이즈(품) 줄이기', desc: '어깨, 가슴, 허리 줄임' },
            { specId: 'structure_top', title: '구조/기타 수선', desc: '상세 설정 없음' }
        ]
    },
    {
        id: 'bottoms',
        label: '하의, 치마',
        items: '슬랙스, 청바지, 치마, 반바지',
        repairTypes: [
            { specId: 'width_reduction', title: '폭 줄이기', desc: '허리, 엉덩이, 통' },
            { specId: 'length_reduction', title: '기장 줄이기', desc: '밑단 기장 줄임' },
            { specId: 'length_extension', title: '기장 늘리기', desc: '밑단 기장 늘림' },
            { specId: 'subsidiary_bottom', title: '부자재/기타', desc: '지퍼, 단추, 기타' }
        ]
    },
    {
        id: 'suits_outer',
        label: '정장/아우터',
        items: '정장자켓, 일반자켓, 코트, 트렌치코트, 야상, 패딩',
        repairTypes: [
            { specId: 'length_reduction', title: '기장 줄이기', desc: '소매, 총장' },
            { specId: 'length_extension', title: '기장 늘리기', desc: '소매, 총장' },
            { specId: 'width_reduction', title: '품 줄이기', desc: '재킷 품, 허리' },
            { specId: 'structure', title: '구조/부위 수선', desc: '주머니, 트임, 안감, 핏' },
            { specId: 'subsidiary', title: '부자재', desc: '단추, 지퍼, 벨트' }
        ]
    },
    {
        id: 'leather',
        label: '가죽자켓',
        items: '가죽자켓, 무스탕, 라이더자켓',
        repairTypes: [
            { specId: 'length_reduction', title: '기장 줄이기', desc: '소매, 총장' },
            { specId: 'subsidiary_leather', title: '부자재', desc: '지퍼, 스냅 단추, 안감' }
        ]
    },
    {
        id: 'other',
        label: '그외 품목',
        items: '모자, 가방, 커튼 등',
        repairTypes: [
            { specId: 'inquiry_only', title: '문의하기', desc: '상담 후 진행' }
        ]
    }
];

interface ImageItem {
    id: string;
    url: string;
    sketchedUrl?: string;
    drawingUrl?: string;
    description: string;
    analysisMessage?: string;
}

// Single Request Item State
interface RepairDetailState {
    amount?: number;
    isMore?: boolean;
    selectedOptions?: string[];
    // Per-option amounts (e.g. {'소매': 3, '총장': 5})
    amounts?: Record<string, number>;
    // Per-option 'more' check (e.g. ['소매'])
    moreOptions?: string[];
}

interface RequestItem {
    id: string;
    images: ImageItem[];
    category: string;

    // Updated for Multi-Select
    selectedRepairSpecs: string[];
    repairDetails: Record<string, RepairDetailState>;

    description: string;
}

export function RepairRequestForm() {
    const router = useRouter();
    const { data: session } = useSession();
    const { alert, confirm } = useAlert();

    // Multi-Item State
    // Helper to create a new item
    const createNewItem = (): RequestItem => ({
        id: Date.now().toString(),
        images: [],
        category: '',
        selectedRepairSpecs: [],
        repairDetails: {},
        description: ''
    });

    // Multi-Item State: Initialize with 1 item immediately to avoid StrictMode double-effect issues
    const [items, setItems] = useState<RequestItem[]>(() => [createNewItem()]);

    // Initialize activeItemId with the ID of the first item
    const [activeItemId, setActiveItemId] = useState<string | null>(() => items[0].id);

    // Global Submission State
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Popup State
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [editingImageItemIndex, setEditingImageItemIndex] = useState<{ itemId: string, imgIndex: number } | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const addItem = () => {
        const newItem = createNewItem();
        setItems(prev => [...prev, newItem]);
        setActiveItemId(newItem.id);
    };

    const removeItem = async (id: string) => {
        if (items.length === 1) {
            await alert("최소 1개의 품목이 필요합니다.", { title: '알림' });
            return;
        }
        setItems(prev => prev.filter(item => item.id !== id));
        if (activeItemId === id) {
            setActiveItemId(items.find(item => item.id !== id)?.id || null);
        }
    };

    const updateItem = (id: string, updates: Partial<RequestItem>) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const activeItem = items.find(item => item.id === activeItemId) || items[0];

    // Repair Spec Logic
    const toggleRepairSpec = (specId: string) => {
        if (!activeItem) return;
        const exists = activeItem.selectedRepairSpecs.includes(specId);
        let newSpecs = exists
            ? activeItem.selectedRepairSpecs.filter(s => s !== specId)
            : [...activeItem.selectedRepairSpecs, specId];

        // Handle Exclusions
        if (!exists) {
            const spec = REPAIR_SPECS[specId];
            if (spec?.excludes) {
                newSpecs = newSpecs.filter(s => !spec.excludes?.includes(s));
            }
        }

        let newDetails = { ...activeItem.repairDetails };

        if (!exists && !newDetails[specId]) {
            // Initialize defaults if adding
            const spec = REPAIR_SPECS[specId];
            if (spec.type === 'range') {
                newDetails[specId] = { amount: 1, isMore: false };
            } else if (spec.type === 'checkbox_group') {
                // Auto-select if only 1 option
                const initialOptions = (spec.options && spec.options.length === 1) ? [spec.options[0]] : [];
                // Initialize amounts map
                newDetails[specId] = { selectedOptions: initialOptions, amounts: {} };
            }
        }

        updateItem(activeItem.id, { selectedRepairSpecs: newSpecs, repairDetails: newDetails });
    };

    const updateRepairDetail = (specId: string, updates: Partial<RepairDetailState>) => {
        if (!activeItem) return;
        const newDetails = {
            ...activeItem.repairDetails,
            [specId]: { ...activeItem.repairDetails[specId], ...updates }
        };
        updateItem(activeItem.id, { repairDetails: newDetails });
    };

    // Image Handlers
    const openUploadPopup = (itemId: string, index?: number) => {
        if (typeof index === 'number') {
            setEditingImageItemIndex({ itemId, imgIndex: index });
        } else {
            setEditingImageItemIndex({ itemId, imgIndex: -1 }); // -1 for new
        }
        setIsPopupOpen(true);
    };

    const handlePopupConfirm = (data: { originalUrl: string; sketchedUrl: string; drawingUrl: string; description: string }) => {
        if (!editingImageItemIndex) return;
        const { itemId, imgIndex } = editingImageItemIndex;

        const targetItem = items.find(i => i.id === itemId);
        if (!targetItem) return;

        let newImages = [...targetItem.images];
        if (imgIndex !== -1) {
            // Edit existing
            newImages[imgIndex] = {
                ...newImages[imgIndex],
                url: data.originalUrl,
                sketchedUrl: data.sketchedUrl,
                drawingUrl: data.drawingUrl,
                description: data.description
            };
        } else {
            // Add new
            newImages.push({
                id: Date.now().toString(),
                url: data.originalUrl,
                sketchedUrl: data.sketchedUrl,
                drawingUrl: data.drawingUrl,
                description: data.description,
                analysisMessage: undefined
            });
        }
        updateItem(itemId, { images: newImages });
        setIsPopupOpen(false);
        setEditingImageItemIndex(null);
    };

    const removeImage = (itemId: string, index: number) => {
        const targetItem = items.find(i => i.id === itemId);
        if (!targetItem) return;
        const newImages = targetItem.images.filter((_, i) => i !== index);
        updateItem(itemId, { images: newImages });
    };

    // AI Analysis Effect
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    // Draft Restoration
    useEffect(() => {
        const draft = localStorage.getItem('suyu_repair_draft');
        if (draft) {
            try {
                const parsed = JSON.parse(draft);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setItems(parsed);
                }
                localStorage.removeItem('suyu_repair_draft');
            } catch (e) {
                console.error(e);
            }
        }
    }, []);
    useEffect(() => {
        if (!activeItem) return;
        const lastIndex = activeItem.images.length - 1;
        if (lastIndex >= 0 && !activeItem.images[lastIndex].analysisMessage && !isAnalyzing) {
            const lastImage = activeItem.images[lastIndex];
            const runAnalysis = async () => {
                try {
                    setIsAnalyzing(true);
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.src = lastImage.url;
                    img.onload = async () => {
                        const result = await analyzeImageCategory(img);
                        if (result && result.probability >= 0.5) {
                            const matchedCategory = CATEGORIES.find(c => c.id === result.categoryId);
                            if (matchedCategory) {
                                setItems(prevItems => prevItems.map(item => {
                                    if (item.id !== activeItem.id) return item;

                                    const updates: Partial<RequestItem> = {};
                                    // Only auto-set category if it's currently empty (checking latest state)
                                    if (!item.category) {
                                        updates.category = result.categoryId;
                                    }

                                    // Update specific image message safely
                                    const newImages = [...item.images];
                                    if (newImages[lastIndex]) {
                                        newImages[lastIndex] = {
                                            ...newImages[lastIndex],
                                            analysisMessage: `AI 분석: ${result.labelKo}`
                                        };
                                        updates.images = newImages;
                                    }

                                    return { ...item, ...updates };
                                }));
                            }
                        }
                        setIsAnalyzing(false);
                    };
                    img.onerror = () => setIsAnalyzing(false);
                } catch (e) { setIsAnalyzing(false); }
            };
            runAnalysis();
        }
    }, [activeItem?.images?.length, activeItem?.id]);

    const getFileFromUrl = async (url: string, name: string): Promise<File> => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], name, { type: blob.type });
    };

    // Helper to process images (upload blobs)
    const processItemImages = async (item: RequestItem): Promise<RequestItem> => {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };

        const newImages = await Promise.all(item.images.map(async (img, index) => {
            let originalUrl = img.url;
            if (img.url.startsWith('blob:') || img.url.startsWith('data:')) {
                const originalFile = await getFileFromUrl(img.url, `item-${item.id}-img-${index}.jpg`);
                const compressedFile = await imageCompression(originalFile, options);
                originalUrl = await uploadImage(compressedFile);
            }

            let sketchedUrl = img.sketchedUrl;
            if (img.sketchedUrl && (img.sketchedUrl.startsWith('blob:') || img.sketchedUrl.startsWith('data:'))) {
                const sketchFile = await getFileFromUrl(img.sketchedUrl, `item-${item.id}-sketch-${index}.png`);
                const compressedSketch = await imageCompression(sketchFile, options);
                sketchedUrl = await uploadImage(compressedSketch);
            }

            return {
                ...img,
                url: originalUrl,
                sketchedUrl
            };
        }));

        return { ...item, images: newImages };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Filter out empty items
        // Empty means: No images AND (No category selected OR category is default/empty)
        const validItems = items.filter(item => item.images.length > 0 || (item.category && item.category !== ''));

        if (validItems.length === 0) {
            await alert('최소 1개 이상의 품목을 작성해주세요 (사진 또는 카테고리 선택 필수)', { title: '작성 내용 없음', variant: 'destructive' });
            return;
        }

        // Check Login Session Before Confirmation
        if (!session || !session.user) {
            setIsSubmitting(true);
            try {
                // Upload images first to ensure persistent URLs for draft
                const processedValidItems = await Promise.all(validItems.map(processItemImages));

                // Update items state with uploaded URLs so they persist
                setItems(prev => prev.map(item => {
                    const processed = processedValidItems.find(p => p.id === item.id);
                    return processed || item;
                }));

                // Save to localStorage
                localStorage.setItem('suyu_repair_draft', JSON.stringify(processedValidItems));
                setIsLoginModalOpen(true);
            } catch (error) {
                console.error(error);
                await alert('이미지 저장 중 오류가 발생했습니다. ' + error, { title: '저장 실패', variant: 'destructive' });
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        // Summary Generation for Confirmation
        const summary = validItems.map((item, idx) => {
            const catLabel = CATEGORIES.find(c => c.id === item.category)?.label || '미선택';
            const repairLabels = item.selectedRepairSpecs.map(id => {
                const label = REPAIR_SPECS[id]?.label;
                const detail = item.repairDetails[id];
                let detailText = '';

                // If per-option amounts exist, build detailed string
                if (detail?.selectedOptions && detail.amounts && Object.keys(detail.amounts).length > 0) {
                    const parts = detail.selectedOptions.map(opt => {
                        const amt = detail.amounts?.[opt];
                        return amt ? `${opt} (${amt}cm${detail.isMore ? '+' : ''})` : opt;
                    });
                    detailText = ` [${parts.join(', ')}]`;
                } else if (detail?.amount) {
                    // Fallback for single amount
                    detailText = ` (${detail.amount}cm${detail.isMore ? '+' : ''})`;
                }
                return `${label}${detailText}`;
            }).join(', ');

            return `[품목 ${idx + 1}] ${catLabel}\n- 수선: ${repairLabels || '선택 없음'}\n- 요청: ${item.description || '없음'}`;
        }).join('\n\n');

        const confirmMessage = (
            <div className="space-y-2">
                <p>다음 내용으로 견적을 요청하시겠습니까?</p>
                {items.length !== validItems.length && (
                    <p className="text-xs text-slate-500 font-medium bg-slate-100 p-2 rounded-lg">
                        * 내용이 없는 {items.length - validItems.length}개 품목은 자동으로 제외됩니다.
                    </p>
                )}
                <div className="text-xs text-slate-600 whitespace-pre-wrap border rounded-lg p-3 bg-slate-50 max-h-40 overflow-y-auto">
                    {summary}
                </div>
            </div>
        );

        const confirmed = await confirm(confirmMessage, {
            title: '견적 요청 확인',
            confirmLabel: '요청하기',
            cancelLabel: '취소'
        });

        if (!confirmed) return;

        setIsSubmitting(true);
        try {
            // Process Items (Use validItems)
            // Ensure images are uploaded (if not already done during draft save or previous step)
            const processedValidItems = await Promise.all(validItems.map(processItemImages));

            const orderItems = processedValidItems.map(item => {
                // Combine Repair Specs
                const repairServiceLabels = item.selectedRepairSpecs.map(id => REPAIR_SPECS[id]?.label).filter(Boolean).join(', ');

                // Keep details as map keyed by specId, filtering only selected ones
                const repairServiceDetailObj = item.selectedRepairSpecs.reduce((acc, specId) => {
                    if (item.repairDetails[specId]) {
                        acc[specId] = item.repairDetails[specId];
                    }
                    return acc;
                }, {} as Record<string, any>);
                const repairServiceDetail = JSON.stringify(repairServiceDetailObj);

                const uploadedImages = item.images.map(img => ({
                    originalUrl: img.url,
                    sketchedUrl: img.sketchedUrl,
                    description: img.description
                }));

                return {
                    category: item.category,
                    repairService: repairServiceLabels,
                    repairServiceDetail,
                    description: item.description,
                    images: uploadedImages
                };
            });

            // Create Order
            await createOrder({
                items: orderItems,
                userEmail: session?.user?.email || undefined,
                userName: session?.user?.name || undefined,
                userImage: session?.user?.image || undefined,
            });

            localStorage.removeItem('suyu_repair_draft');
            router.push('/orders');

        } catch (error) {
            console.error(error);
            await alert('주문 접수에 실패했습니다. ' + error, { title: '접수 실패', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helpers for rendering
    const selectedCategoryData = activeItem ? CATEGORIES.find(c => c.id === activeItem.category) : null;

    if (!activeItem) return <div>Loading...</div>;

    return (
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 w-full relative z-10 transition-all duration-300 min-h-[600px]">
            <h2 className="text-lg md:text-2xl font-bold text-slate-900 mb-6 text-center">무료로 수선 견적을 받아보세요</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 h-full">

                {/* LEFT COLUMN: Item List (md:col-span-4) */}
                <div className="md:col-span-4 flex flex-col gap-3 border-r border-slate-100 pr-0 md:pr-6">
                    <div className="flex items-center justify-between mb-2 gap-2 flex-nowrap">
                        <label className="text-sm font-bold text-slate-800 whitespace-nowrap">어떤 옷을 고쳐드릴까요? ({items.length})</label>
                        <Button type="button" onClick={addItem} size="sm" variant="outline" className="hidden lg:inline-flex h-8 text-xs gap-1 rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 flex-shrink-0">
                            <Plus className="w-3.5 h-3.5" /> 다른 옷 추가
                        </Button>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[500px] p-1">
                        {items.map((item, index) => {
                            const hasImages = item.images.length > 0;
                            const thumbnail = hasImages ? (item.images[0].sketchedUrl || item.images[0].url) : null;
                            const catLabel = CATEGORIES.find(c => c.id === item.category)?.label.split(' ')[0] || '미선택';
                            const isActive = item.id === activeItemId;
                            // Generate summary of selected types
                            const selectedLabels = item.selectedRepairSpecs.map(id => REPAIR_SPECS[id]?.label).join(', ');

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        setActiveItemId(item.id);
                                        if (item.images.length === 0) {
                                            openUploadPopup(item.id);
                                        }
                                    }}
                                    className={cn(
                                        "relative flex gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md group",
                                        isActive ? "bg-blue-50/50 border-blue-500 ring-1 ring-blue-500" : "bg-white border-slate-200 hover:border-blue-300"
                                    )}
                                >
                                    <div className="w-16 h-16 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-100 flex items-center justify-center">
                                        {thumbnail ? (
                                            <img src={thumbnail} className="w-full h-full object-cover" alt="thumb" />
                                        ) : (
                                            <Shirt className="w-6 h-6 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <span className="text-xs font-bold text-slate-800 block truncate">
                                            품목 {index + 1}: {catLabel}
                                        </span>
                                        <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                                            {selectedLabels || '수선 내용 미선택'}
                                        </span>
                                        <span className="text-[10px] text-slate-400 block mt-1">
                                            사진 {item.images.length}장
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                                        className="opacity-0 group-hover:opacity-100 hover:text-red-500 p-1 absolute top-2 right-2 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    {/* Add Button for mobile/tablet (< lg) */}
                    <Button type="button" onClick={addItem} size="sm" variant="outline" className="w-full lg:hidden h-10 text-sm gap-1 rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 mt-2">
                        <Plus className="w-4 h-4" /> 다른 옷 추가
                    </Button>
                </div>

                {/* RIGHT COLUMN: Active Item Details (md:col-span-8) */}
                <div className="md:col-span-8 space-y-8 pl-0 md:pl-2 relative">
                    {/* Loading Overlay */}
                    {isAnalyzing && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-xl animate-in fade-in duration-300">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                            <p className="text-lg font-bold text-slate-800">AI가 옷을 분석하고 있어요...</p>
                            <p className="text-sm text-slate-500 mt-1">잠시만 기다려주세요</p>
                        </div>
                    )}

                    {/* Image Area */}
                    <div className="space-y-4">
                        <label className="text-[13px] md:text-sm font-semibold text-slate-700 block">
                            [{items.indexOf(activeItem) + 1}번 품목] 사진을 보여주세요
                        </label>
                        <div ref={scrollContainerRef} className="grid grid-cols-3 gap-3 pb-2">
                            {/* 1. Existing Images */}
                            {activeItem.images.map((img, idx) => (
                                <div key={img.id} className="aspect-[3/4]">
                                    <ImageSlot
                                        image={img.sketchedUrl || img.url}
                                        onRemove={() => removeImage(activeItem.id, idx)}
                                        onClick={() => openUploadPopup(activeItem.id, idx)}
                                        label={`사진 ${idx + 1}`}
                                        message={img.analysisMessage}
                                        isAnalyzing={isAnalyzing && idx === activeItem.images.length - 1}
                                    />
                                </div>
                            ))}

                            {/* 2. Active Add Button (If not full) */}
                            {activeItem.images.length < 5 && (
                                <div className="aspect-[3/4]">
                                    <ImageSlot
                                        image={null}
                                        onClick={() => openUploadPopup(activeItem.id)}
                                        label="사진 추가"
                                    />
                                </div>
                            )}

                            {/* 3. Faint Placeholders (To fill up to 3 slots total) */}
                            {Array.from({ length: Math.max(0, 3 - activeItem.images.length - (activeItem.images.length < 5 ? 1 : 0)) }).map((_, i) => (
                                <div key={`placeholder-${i}`} className="aspect-[3/4]">
                                    <ImageSlot
                                        image={null}
                                        label=""
                                        faint
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400 font-medium">
                            * 최대 5장까지 업로드 가능합니다.
                        </p>
                    </div>

                    {/* Extension Warning */}


                    {/* Extension Warning */}
                    {activeItem.selectedRepairSpecs.some(spec => ['length_extension', 'width_extension'].includes(spec)) && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm text-amber-800 animate-in fade-in slide-in-from-top-1">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                            <div className="space-y-1">
                                <p className="font-semibold">늘리기 수선 안내</p>
                                <p className="text-amber-700 opacity-90">
                                    늘리기 수선은 안감(시접) 여유분이 있어야 가능합니다.
                                    <br />
                                    <span className="font-bold underline">소매단이나 밑단을 뒤집어서</span> 여유분 확인이 가능한 사진을 꼭 첨부해 주세요.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Category Selection */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <label className="text-[13px] md:text-sm font-semibold text-slate-700 block">어떤 종류의 옷인가요?</label>
                            {selectedCategoryData && (
                                <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                                    {selectedCategoryData.label}
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => updateItem(activeItem.id, { category: cat.id, selectedRepairSpecs: [], repairDetails: {} })}
                                    className={cn(
                                        "p-3 rounded-xl border text-left transition-all relative overflow-hidden group h-full",
                                        activeItem.category === cat.id
                                            ? "bg-blue-600 border-blue-600 text-white shadow-md ring-2 ring-blue-200 ring-offset-1"
                                            : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50"
                                    )}
                                >
                                    <div className="relative z-10 flex flex-col justify-between h-full gap-1">
                                        <span className={cn("text-sm font-bold block", activeItem.category === cat.id ? "text-white" : "text-slate-800")}>
                                            {cat.label}
                                        </span>
                                        <span className={cn("text-[10px] block line-clamp-1", activeItem.category === cat.id ? "text-blue-100" : "text-slate-400")}>
                                            {cat.items}
                                        </span>
                                    </div>
                                    {activeItem.category === cat.id && (
                                        <div className="absolute top-2 right-2 text-white/20">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Repair Specs */}
                    {selectedCategoryData && (
                        <div className="space-y-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <label className="text-[13px] md:text-sm font-semibold text-slate-700 block mb-3">어떤 수선이 필요하신가요?</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {selectedCategoryData.repairTypes.map((type) => {
                                        const isSelected = activeItem.selectedRepairSpecs.includes(type.specId);
                                        return (
                                            <button
                                                key={type.specId}
                                                type="button"
                                                onClick={() => toggleRepairSpec(type.specId)}
                                                className={cn(
                                                    "p-4 rounded-xl border text-left transition-all relative overflow-hidden",
                                                    isSelected
                                                        ? "bg-blue-50 border-blue-500 shadow-sm"
                                                        : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                                                )}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <span className={cn("text-sm font-bold block mb-1", isSelected ? "text-blue-700" : "text-slate-800")}>
                                                            {type.title}
                                                        </span>
                                                        <span className="text-xs text-slate-500 block leading-relaxed">
                                                            {type.desc}
                                                        </span>
                                                    </div>
                                                    <div className={cn(
                                                        "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                                                        isSelected ? "bg-blue-500 border-transparent" : "border-slate-300 bg-white"
                                                    )}>
                                                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Detail Config Fields */}
                            {activeItem.selectedRepairSpecs.length > 0 && (
                                <div className="space-y-6 pt-4 border-t border-slate-100 bg-slate-50/50 p-4 rounded-2xl">
                                    {activeItem.selectedRepairSpecs.map(specId => {
                                        const spec = REPAIR_SPECS[specId];
                                        const detail = activeItem.repairDetails[specId] || {};
                                        if (!spec) return null;

                                        // If this spec has sub-options (e.g. Sleeve, Length), we HIDE the generic selector entirely
                                        const hasSubOptions = spec.options && spec.options.length > 0;

                                        return (
                                            <div key={specId} className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                    {spec.label} 상세 설정
                                                </h4>

                                                {spec.type === 'range' && (
                                                    <div className="space-y-4">
                                                        {/* Sub Options (e.g. Sleeve vs Total Length) */}
                                                        {hasSubOptions && (
                                                            <div className="grid grid-cols-2 gap-3 mb-2">
                                                                {spec.options!.map((opt) => {
                                                                    const isOptSelected = detail.selectedOptions?.includes(opt) || false;
                                                                    const currentVal = detail.amounts?.[opt] ?? '';
                                                                    const isMoreChecked = detail.moreOptions?.includes(opt) || false;

                                                                    return (
                                                                        <label
                                                                            key={opt}
                                                                            className={cn(
                                                                                "flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition-all shadow-sm hover:shadow-md h-full relative overflow-hidden",
                                                                                isOptSelected
                                                                                    ? "bg-blue-50 border-blue-500 ring-1 ring-blue-200"
                                                                                    : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                                                                            )}
                                                                            onClick={(e) => {
                                                                                // If clicking the card background (not input/checkbox), toggle selection
                                                                                // But we need to be careful not to trigger if clicking children
                                                                            }}
                                                                        >
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className={cn(
                                                                                        "w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                                                                                        isOptSelected ? "bg-blue-600 border-transparent" : "border-slate-300 bg-white"
                                                                                    )}>
                                                                                        {isOptSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                                                    </div>
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        className="hidden"
                                                                                        checked={isOptSelected}
                                                                                        onChange={(e) => {
                                                                                            const current = detail.selectedOptions || [];
                                                                                            const newOptions = e.target.checked
                                                                                                ? [...current, opt]
                                                                                                : current.filter(o => o !== opt);

                                                                                            // Clean up data if unchecking
                                                                                            let newAmounts = { ...detail.amounts };
                                                                                            let newMoreOptions = detail.moreOptions || [];

                                                                                            if (!e.target.checked) {
                                                                                                delete newAmounts[opt];
                                                                                                newMoreOptions = newMoreOptions.filter(m => m !== opt);
                                                                                            }

                                                                                            updateRepairDetail(specId, {
                                                                                                selectedOptions: newOptions,
                                                                                                amounts: newAmounts,
                                                                                                moreOptions: newMoreOptions
                                                                                            });
                                                                                        }}
                                                                                    />
                                                                                    <span className={cn("text-sm transition-colors", isOptSelected ? "font-bold text-blue-800" : "font-medium text-slate-700")}>{opt}</span>
                                                                                </div>
                                                                            </div>

                                                                            {/* Quantity Input for selected option */}
                                                                            {isOptSelected && (
                                                                                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                                    <div className="relative">
                                                                                        <input
                                                                                            type="number"
                                                                                            min={spec.min}
                                                                                            max={spec.max}
                                                                                            value={currentVal}
                                                                                            disabled={isMoreChecked}
                                                                                            onChange={(e) => {
                                                                                                const valStr = e.target.value;
                                                                                                if (valStr === '') {
                                                                                                    const newAmounts = { ...detail.amounts };
                                                                                                    delete newAmounts[opt];
                                                                                                    updateRepairDetail(specId, { amounts: newAmounts });
                                                                                                    return;
                                                                                                }
                                                                                                const val = Math.min(Math.max(Number(valStr), spec.min || 1), spec.max || 100);
                                                                                                const newAmounts = { ...detail.amounts, [opt]: val };
                                                                                                updateRepairDetail(specId, { amounts: newAmounts });
                                                                                            }}
                                                                                            className="w-full pl-3 pr-8 py-2 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-bold text-slate-900 bg-white shadow-inner disabled:bg-slate-100 disabled:text-slate-400"
                                                                                            placeholder={isMoreChecked ? "-" : "0"}
                                                                                            onClick={(e) => e.stopPropagation()}
                                                                                        />
                                                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium pointer-events-none">cm</span>
                                                                                    </div>

                                                                                    {/* 'More' Checkbox per option */}
                                                                                    {spec.allowMore && (
                                                                                        <label className="flex items-center gap-2 cursor-pointer pt-1" onClick={(e) => e.stopPropagation()}>
                                                                                            <div className={cn(
                                                                                                "w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors",
                                                                                                isMoreChecked ? "bg-blue-600 border-transparent" : "border-slate-300 bg-white"
                                                                                            )}>
                                                                                                {isMoreChecked && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                                                                                            </div>
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                className="hidden"
                                                                                                checked={isMoreChecked}
                                                                                                onChange={(e) => {
                                                                                                    const currentMore = detail.moreOptions || [];
                                                                                                    const newMore = e.target.checked
                                                                                                        ? [...currentMore, opt]
                                                                                                        : currentMore.filter(m => m !== opt);

                                                                                                    // Clear amount if checking 'more'
                                                                                                    let newAmounts = { ...detail.amounts };
                                                                                                    if (e.target.checked) {
                                                                                                        delete newAmounts[opt];
                                                                                                    }

                                                                                                    updateRepairDetail(specId, {
                                                                                                        moreOptions: newMore,
                                                                                                        amounts: newAmounts
                                                                                                    });
                                                                                                }}
                                                                                            />
                                                                                            <span className="text-xs text-slate-500">{spec.max}{spec.unit} 이상</span>
                                                                                        </label>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </label>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}

                                                        {/* General Dimension Selector - ONLY show if NO sub-options are defined */}
                                                        {!hasSubOptions && (
                                                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-sm font-medium text-slate-600">
                                                                        치수 선택 ({spec.unit})
                                                                    </span>
                                                                    {spec.allowMore && (
                                                                        <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer hover:text-blue-600 transition-colors">
                                                                            <div className={cn(
                                                                                "w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors",
                                                                                detail.isMore ? "bg-blue-600 border-transparent" : "border-slate-300 bg-white"
                                                                            )}>
                                                                                {detail.isMore && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                                                                            </div>
                                                                            <input
                                                                                type="checkbox"
                                                                                className="hidden"
                                                                                checked={detail.isMore || false}
                                                                                onChange={(e) => updateRepairDetail(specId, { isMore: e.target.checked })}
                                                                            />
                                                                            <span>{spec.max}{spec.unit} 이상 필요</span>
                                                                        </label>
                                                                    )}
                                                                </div>

                                                                <div className="relative">
                                                                    <select
                                                                        value={detail.amount || spec.min}
                                                                        onChange={(e) => updateRepairDetail(specId, { amount: Number(e.target.value) })}
                                                                        disabled={detail.isMore}
                                                                        className="w-full h-12 pl-4 pr-10 bg-white border border-slate-200 rounded-xl text-slate-900 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed appearance-none active:bg-blue-50 transition-colors font-medium"
                                                                    >
                                                                        {Array.from({ length: (spec.max! - spec.min!) + 1 }, (_, i) => spec.min! + i).map((num) => (
                                                                            <option key={num} value={num}>
                                                                                {num} {spec.unit}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    {/* Custom Arrow Icon */}
                                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                                    </div>
                                                                </div>

                                                                {detail.isMore && (
                                                                    <p className="text-xs text-blue-600 font-medium ml-1 mt-2 animate-in fade-in slide-in-from-top-1">
                                                                        * {spec.max}{spec.unit} 이상은 '더 전하고 싶은 말씀'에 적어주세요. 꼼꼼히 상담해 드릴게요.
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Checkbox Group */}
                                                {spec.type === 'checkbox_group' && spec.options && (
                                                    <div className="space-y-2">
                                                        {spec.options.map((opt) => (
                                                            <label key={opt} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-blue-300 transition-colors">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={detail.selectedOptions?.includes(opt) || false}
                                                                    onChange={() => {
                                                                        const currentOpts = detail.selectedOptions || [];
                                                                        const newOpts = currentOpts.includes(opt)
                                                                            ? currentOpts.filter(o => o !== opt)
                                                                            : [...currentOpts, opt];
                                                                        updateRepairDetail(specId, { selectedOptions: newOpts });
                                                                    }}
                                                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                                />
                                                                <span className="text-sm text-slate-700">{opt}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-[13px] md:text-sm font-semibold text-slate-700 block">더 전하고 싶은 말씀이 있나요?</label>
                        <textarea
                            value={activeItem.description}
                            onChange={(e) => updateItem(activeItem.id, { description: e.target.value })}
                            placeholder="이 품목에 대한 특별한 요청사항이 있다면 적어주세요."
                            className="w-full h-20 p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-slate-50 text-xs"
                        />
                    </div>
                </div>

                {/* Footer Submit */}
                <div className="md:col-span-12 mt-4 pt-4 border-t border-slate-100">
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full h-14 text-base font-bold bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                        isLoading={isSubmitting}
                    >
                        {items.length}벌의 수선 견적 요청하기
                    </Button>
                </div>
            </form>

            <ImageSketchPopup
                isOpen={isPopupOpen}
                onClose={() => { setIsPopupOpen(false); setEditingImageItemIndex(null); }}
                onConfirm={handlePopupConfirm}
                initialData={(editingImageItemIndex && editingImageItemIndex.imgIndex !== -1) ? {
                    originalUrl: activeItem.images[editingImageItemIndex.imgIndex].url,
                    sketchedUrl: activeItem.images[editingImageItemIndex.imgIndex].sketchedUrl || null,
                    drawingUrl: activeItem.images[editingImageItemIndex.imgIndex].drawingUrl || null,
                    description: activeItem.images[editingImageItemIndex.imgIndex].description
                } : null}
            />

            {/* Login Modal for Deferred Login */}
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                title="견적 요청을 위해 로그인이 필요해요"
                description={
                    <>
                        작성하신 내용을 안전하게 저장하고<br className="hidden md:block" />
                        바로 접수해 드릴게요!
                    </>
                }
            />
        </div>
    );
}

function ImageSlot({ label, image, message, isAnalyzing, onClick, onRemove, faint }: { label: string; image: string | null; message?: string; isAnalyzing?: boolean; onClick?: () => void; onRemove?: () => void; faint?: boolean }) {
    return (
        <div className={cn("relative w-full h-full", faint && "opacity-30 hover:opacity-100 transition-opacity duration-300")}>
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

                    {/* Analyzing Overlay */}
                    {isAnalyzing && (
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-20 backdrop-blur-sm animate-in fade-in duration-300">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
                                <Loader2 className="w-8 h-8 text-blue-400 animate-spin relative z-10" />
                            </div>
                            <span className="text-white text-[10px] font-bold mt-2 animate-pulse">분석중...</span>
                        </div>
                    )}

                    <div className={`absolute bottom-0 left-0 w-full p-2 pointer-events-none rounded-b-2xl transition-all duration-500 ${message ? 'bg-gradient-to-t from-black/90 via-black/70 to-transparent' : 'bg-gradient-to-t from-black/60 to-transparent'}`}>
                        {message ? (
                            <div className="text-left animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-1 mb-0.5 opacity-100">
                                    <Sparkles className="w-2 h-2 text-blue-300 fill-blue-300" />
                                    <span className="text-blue-300 font-bold text-[9px] tracking-wide">AI 분석</span>
                                </div>
                                <p className="text-white/95 text-[10px] font-medium leading-tight drop-shadow-md break-keep truncate">
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
                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center mb-2 transition-colors shadow-sm">
                        <Plus className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium group-hover:text-blue-600 transition-colors text-center px-1">{label}</span>
                </div>
            )}
        </div>
    );
}
