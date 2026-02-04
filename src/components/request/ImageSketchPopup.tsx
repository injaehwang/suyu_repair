'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SketchCanvas, SketchCanvasHandle } from './SketchCanvas';
import { Upload, Check, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageSketchPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { originalUrl: string; sketchedUrl: string; drawingUrl: string; description: string }) => void;
    initialData?: {
        originalUrl: string;
        sketchedUrl: string | null;
        drawingUrl?: string | null;
        description: string;
    } | null;
}

export function ImageSketchPopup({ isOpen, onClose, onConfirm, initialData }: ImageSketchPopupProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [drawingUrl, setDrawingUrl] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const canvasRef = useRef<SketchCanvasHandle>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize with initialData when it changes or popup opens
    useEffect(() => {
        if (isOpen && initialData) {
            setImageUrl(initialData.originalUrl);
            setDrawingUrl(initialData.drawingUrl || null);
            setDescription(initialData.description);
        } else if (isOpen && !initialData) {
            resetState();
        }
    }, [isOpen, initialData]);


    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImageUrl(url);
            // We don't necessarily need to set sketchedUrl here, canvas will handle it
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleConfirm = () => {
        if (imageUrl && canvasRef.current) {
            const finalSketch = canvasRef.current.getCanvasData();
            const currentDrawing = canvasRef.current.getDrawingData();

            onConfirm({
                originalUrl: imageUrl,
                sketchedUrl: finalSketch,
                drawingUrl: currentDrawing,
                description
            });
            handleClose();
        }
    };

    const resetState = () => {
        setImageUrl(null);
        setDrawingUrl(null);
        setDescription('');
        // Also probably need to reset canvas state, but component unmount/remount handles it
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            {/* Increased max-width for larger popup */}
            <DialogContent className="sm:max-w-3xl max-h-[100dvh] h-[100dvh] sm:h-auto overflow-hidden w-full sm:w-[95vw] p-0 gap-0 flex flex-col bg-slate-50 border-none sm:border">
                <DialogHeader className="p-4 bg-white border-b border-slate-100 flex-shrink-0">
                    <DialogTitle className="text-center font-bold text-lg md:text-xl flex items-center justify-center gap-2">
                        <ImageIcon className="w-5 h-5 text-blue-600" />
                        사진 업로드 및 요청사항
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto outline-none">
                    <div className="p-4 md:p-6 space-y-6 pb-32">
                        {/* Top Area: Canvas / Upload Placeholder */}
                        <div className="flex flex-col items-center justify-center w-full">
                            {!imageUrl ? (
                                <div
                                    onClick={triggerFileUpload}
                                    className="w-full max-w-xl h-[300px] md:h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl bg-white hover:bg-slate-50 transition-all cursor-pointer group shadow-sm hover:shadow-md animate-in fade-in zoom-in-95 duration-300"
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center mb-4 md:mb-6 transition-colors duration-300">
                                        <Upload className="w-8 h-8 md:w-10 md:h-10 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                    <p className="text-base md:text-lg font-bold text-slate-700 mb-1 md:mb-2">사진을 업로드해주세요</p>
                                    <p className="text-slate-400 text-xs md:text-sm">클릭하거나 파일을 드래그하세요</p>
                                </div>
                            ) : (
                                <div className="w-full flex justify-center overflow-hidden">
                                    <SketchCanvas
                                        ref={canvasRef}
                                        backgroundImage={imageUrl}
                                        initialDrawing={drawingUrl}
                                        className="w-full"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Bottom Area: Description */}
                        <div className="max-w-2xl mx-auto w-full space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                    상세 설명
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="수선이 필요한 부분에 대해 자세히 설명해주세요."
                                    className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm resize-none text-[13px] md:text-sm transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action - fixed at bottom */}
                <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0 flex justify-end gap-3 items-center safe-area-bottom">
                    <Button variant="ghost" onClick={handleClose} className="text-slate-500 hover:text-slate-700 font-medium h-12">취소</Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!imageUrl}
                        className={cn(
                            "px-8 h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg hover:shadow-blue-200 transition-all duration-300 flex items-center gap-2",
                            !imageUrl && "opacity-50 cursor-not-allowed bg-slate-300 text-slate-500 shadow-none hover:bg-slate-300"
                        )}
                    >
                        <span>입력 완료</span>
                        <Check className="w-5 h-5" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
