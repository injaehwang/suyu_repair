'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Eraser, Pen, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SketchCanvasProps {
    backgroundImage: string | null;
    width?: number;
    height?: number;
    className?: string;
    disabled?: boolean;
}

export interface SketchCanvasHandle {
    getCanvasData: () => string;
}

type Tool = 'pen' | 'eraser' | 'move';

export const SketchCanvas = forwardRef<SketchCanvasHandle, SketchCanvasProps>(
    ({ backgroundImage, width = 600, height = 500, className, disabled = false }, ref) => {
        // Container refs
        const containerRef = useRef<HTMLDivElement>(null);

        // Canvas refs
        const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
        const drawingCanvasRef = useRef<HTMLCanvasElement>(null);

        // State
        const [mode, setMode] = useState<Tool>('pen');
        const [isDrawing, setIsDrawing] = useState(false);
        const [scale, setScale] = useState(1);
        const [position, setPosition] = useState({ x: 0, y: 0 });
        const [isDragging, setIsDragging] = useState(false);
        const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

        // Images
        const imgRef = useRef<HTMLImageElement | null>(null);

        useImperativeHandle(ref, () => ({
            getCanvasData: () => {
                if (!imgRef.current) return '';

                // Create a temporary canvas to merge background and drawing
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = width;
                tempCanvas.height = height;
                const ctx = tempCanvas.getContext('2d');
                if (!ctx) return '';

                // Draw background
                if (backgroundCanvasRef.current) {
                    ctx.drawImage(backgroundCanvasRef.current, 0, 0);
                }
                // Draw drawing
                if (drawingCanvasRef.current) {
                    ctx.drawImage(drawingCanvasRef.current, 0, 0);
                }

                return tempCanvas.toDataURL('image/png');
            }
        }));

        // Initialize Background
        useEffect(() => {
            if (!backgroundImage) return;

            const bgCanvas = backgroundCanvasRef.current;
            const drawCanvas = drawingCanvasRef.current;

            if (!bgCanvas || !drawCanvas) return;

            const bgCtx = bgCanvas.getContext('2d');

            // Clear both
            bgCtx?.clearRect(0, 0, width, height);

            const img = new Image();
            img.src = backgroundImage;
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                imgRef.current = img;
                if (bgCtx) drawFitImage(bgCtx, img, width, height);
            };

        }, [backgroundImage, width, height]);

        const drawFitImage = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) => {
            const scaleFactor = Math.min(w / img.width, h / img.height);
            const x = (w / 2) - (img.width / 2) * scaleFactor;
            const y = (h / 2) - (img.height / 2) * scaleFactor;
            ctx.drawImage(img, x, y, img.width * scaleFactor, img.height * scaleFactor);
        };

        // Drawing Logic
        const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
            const canvas = drawingCanvasRef.current;
            if (!canvas) return { x: 0, y: 0 };
            const rect = canvas.getBoundingClientRect();

            let clientX, clientY;
            if ('touches' in e) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = (e as React.MouseEvent).clientX;
                clientY = (e as React.MouseEvent).clientY;
            }

            // Adjust for scale and position
            return {
                x: (clientX - rect.left) / scale,
                y: (clientY - rect.top) / scale
            };
        };

        const startAction = (e: React.MouseEvent | React.TouchEvent) => {
            if (disabled) return;
            if (mode === 'move') {
                setIsDragging(true);
                let clientX, clientY;
                if ('touches' in e) {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                } else {
                    clientX = (e as React.MouseEvent).clientX;
                    clientY = (e as React.MouseEvent).clientY;
                }
                setDragStart({ x: clientX - position.x, y: clientY - position.y });
            } else {
                setIsDrawing(true);
                const ctx = drawingCanvasRef.current?.getContext('2d');
                if (ctx) {
                    ctx.beginPath();
                    const { x, y } = getCoordinates(e);
                    ctx.moveTo(x, y);

                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    if (mode === 'eraser') {
                        ctx.globalCompositeOperation = 'destination-out';
                        ctx.lineWidth = 20 / scale; // Compensate scale
                    } else {
                        ctx.globalCompositeOperation = 'source-over';
                        ctx.strokeStyle = 'red';
                        ctx.lineWidth = 3 / scale;
                    }
                }
            }
        };

        const moveAction = (e: React.MouseEvent | React.TouchEvent) => {
            if (disabled) return;
            if (mode === 'move' && isDragging) {
                let clientX, clientY;
                if ('touches' in e) {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                } else {
                    clientX = (e as React.MouseEvent).clientX;
                    clientY = (e as React.MouseEvent).clientY;
                }
                setPosition({
                    x: clientX - dragStart.x,
                    y: clientY - dragStart.y
                });
            } else if (isDrawing) {
                const ctx = drawingCanvasRef.current?.getContext('2d');
                if (ctx) {
                    const { x, y } = getCoordinates(e);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
            }
        };

        const stopAction = () => {
            setIsDrawing(false);
            setIsDragging(false);
        };

        const clearDrawing = () => {
            const ctx = drawingCanvasRef.current?.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, width, height);
        };

        const handleZoom = (delta: number) => {
            setScale(prev => Math.min(Math.max(0.5, prev + delta), 3));
        };

        return (
            <div className={cn("flex flex-col items-center gap-4", className)}>
                {/* Toolbar */}
                <div className="flex flex-wrap gap-2 p-2 bg-slate-100 rounded-lg w-full justify-center">
                    <div className="flex gap-1 border-r border-slate-300 pr-2 mr-2">
                        <Button
                            type="button"
                            variant={mode === 'move' ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => setMode('move')}
                            disabled={disabled}
                            title="이동"
                        >
                            <Move className="w-4 h-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleZoom(0.1)}
                            disabled={disabled}
                        >
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleZoom(-0.1)}
                            disabled={disabled}
                        >
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                    </div>

                    <Button
                        type="button"
                        variant={mode === 'pen' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMode('pen')}
                        disabled={disabled}
                    >
                        <Pen className="w-4 h-4 mr-2" />
                        그리기
                    </Button>
                    <Button
                        type="button"
                        variant={mode === 'eraser' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMode('eraser')}
                        disabled={disabled}
                    >
                        <Eraser className="w-4 h-4 mr-2" />
                        지우개
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearDrawing}
                        disabled={disabled}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        초기화
                    </Button>
                </div>

                {/* Canvas Container */}
                <div
                    ref={containerRef}
                    className="relative border-2 border-slate-200 rounded-lg overflow-hidden bg-slate-50 touch-none shadow-inner"
                    style={{ width: width, height: height, cursor: mode === 'move' ? (isDragging ? 'grabbing' : 'grab') : 'crosshair' }}
                >
                    <div
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transformOrigin: '0 0',
                            width: '100%',
                            height: '100%',
                            touchAction: 'none'
                        }}
                    >
                        {/* Background Canvas (Static Image) */}
                        <canvas
                            ref={backgroundCanvasRef}
                            width={width}
                            height={height}
                            className="absolute inset-0 pointer-events-none"
                        />
                        {/* Drawing Canvas (Transparent Layer) */}
                        <canvas
                            ref={drawingCanvasRef}
                            width={width}
                            height={height}
                            onMouseDown={startAction}
                            onMouseMove={moveAction}
                            onMouseUp={stopAction}
                            onMouseLeave={stopAction}
                            onTouchStart={startAction}
                            onTouchMove={moveAction}
                            onTouchEnd={stopAction}
                            className="absolute inset-0"
                        />
                    </div>
                </div>
                <div className="text-center text-xs text-slate-400">
                    {mode === 'move' ? '드래그하여 이미지를 이동하세요' : '이미지 위에 자유롭게 표시하세요'} | 확대/축소: {Math.round(scale * 100)}%
                </div>
            </div>
        );
    }
);

SketchCanvas.displayName = 'SketchCanvas';
