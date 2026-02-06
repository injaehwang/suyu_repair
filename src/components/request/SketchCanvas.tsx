'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle, useLayoutEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Eraser, Pen, ZoomIn, ZoomOut, Move, Hand } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SketchCanvasProps {
    backgroundImage: string | null;
    width?: number;
    height?: number;
    className?: string;
    disabled?: boolean;
    initialDrawing?: string | null;
}

export interface SketchCanvasHandle {
    getCanvasData: () => string;
    getDrawingData: () => string;
}

type Tool = 'pen' | 'eraser' | 'move';

export const SketchCanvas = forwardRef<SketchCanvasHandle, SketchCanvasProps>(
    ({ backgroundImage, width: initialWidth, height: initialHeight, className, disabled = false, initialDrawing }, ref) => {
        // Container refs
        const containerRef = useRef<HTMLDivElement>(null);
        // Canvas refs
        const drawingCanvasRef = useRef<HTMLCanvasElement>(null);

        // State
        const [mode, setMode] = useState<Tool>('pen');
        const [isDrawing, setIsDrawing] = useState(false);
        const [scale, setScale] = useState(1);
        const [position, setPosition] = useState({ x: 0, y: 0 });
        const [isDragging, setIsDragging] = useState(false);
        const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
        const [canvasSize, setCanvasSize] = useState({ width: initialWidth || 600, height: initialHeight || 500 });
        const [imageLoaded, setImageLoaded] = useState(false);

        // Touch state
        const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);

        // Image Ref for saving
        const imgRef = useRef<HTMLImageElement | null>(null);

        // Constants
        const CANVAS_PADDING = 48;

        // Load initial drawing
        useEffect(() => {
            if (initialDrawing && drawingCanvasRef.current) {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = initialDrawing;
                img.onload = () => {
                    const ctx = drawingCanvasRef.current?.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height); // Clear before drawing
                        ctx.drawImage(img, 0, 0, canvasSize.width, canvasSize.height);
                    }
                };
            }
        }, [initialDrawing, canvasSize.width, canvasSize.height]);

        // Calculate and lock aspect ratio based on image
        const updateCanvasSize = () => {
            if (!containerRef.current || !imgRef.current) return;

            const containerW = containerRef.current.offsetWidth;
            // Mobile-optimized max height
            const isMobile = window.innerWidth < 768;
            const maxH = isMobile
                ? Math.min(window.innerHeight * 0.5, 400) // Mobile: max 50vh or 400px
                : window.innerHeight * 0.7; // Desktop: 70vh

            const imgW = imgRef.current.naturalWidth || 1;
            const imgH = imgRef.current.naturalHeight || 1;

            // We want the "Canvas Content Area" (minus padding) to match the Image Ratio.
            // Target Ratio = imgW / imgH
            // CanvasW = ContentW + 2*Padding
            // CanvasH = ContentH + 2*Padding
            // ContentW / ContentH = imgW / imgH

            // Let's try to maximize size within ContainerW and MaxH constraints.

            // Option 1: Fit by Width
            // Ensure strictly positive
            let contentW = Math.max(10, containerW - (CANVAS_PADDING * 2));
            let contentH = contentW * (imgH / imgW);

            let finalW = contentW + (CANVAS_PADDING * 2);
            let finalH = contentH + (CANVAS_PADDING * 2);

            // Check if height exceeds max
            if (finalH > maxH) {
                // Fit by Height
                finalH = maxH;
                contentH = Math.max(10, finalH - (CANVAS_PADDING * 2));
                contentW = contentH * (imgW / imgH);
                finalW = contentW + (CANVAS_PADDING * 2);
            }

            setCanvasSize({ width: finalW, height: finalH });
        };

        // Trigger resize when image loads
        const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
            imgRef.current = e.currentTarget;
            setImageLoaded(true);
            updateCanvasSize();
        };

        // Handle window resize
        useEffect(() => {
            window.addEventListener('resize', updateCanvasSize);
            return () => window.removeEventListener('resize', updateCanvasSize);
        }, [imageLoaded]); // Re-bind when image state changes

        useImperativeHandle(ref, () => ({
            getCanvasData: () => {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvasSize.width;
                tempCanvas.height = canvasSize.height;
                const ctx = tempCanvas.getContext('2d');
                if (!ctx) return '';

                // Draw Background Image
                if (imgRef.current) {
                    const img = imgRef.current;
                    const w = canvasSize.width;
                    const h = canvasSize.height;

                    // Re-calculate placement logic to match exactly what we did in resize
                    // Our resize logic ensured that (w - 2P) / (h - 2P) == imgW / imgH
                    // So we can just draw image into the "inner box"

                    const availW = w - (CANVAS_PADDING * 2);
                    const availH = h - (CANVAS_PADDING * 2);

                    // Since we enforced aspect ratio, object-contain is equivalent to "fill available"
                    ctx.drawImage(img, CANVAS_PADDING, CANVAS_PADDING, availW, availH);
                }

                // Draw drawing
                if (drawingCanvasRef.current) {
                    ctx.drawImage(drawingCanvasRef.current, 0, 0);
                }

                return tempCanvas.toDataURL('image/png');
            },
            getDrawingData: () => {
                if (drawingCanvasRef.current) {
                    return drawingCanvasRef.current.toDataURL('image/png');
                }
                return '';
            }
        }));

        // Coordinate calculation helper that handles both Mouse and Touch events
        const getCoordinates = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
            const canvas = drawingCanvasRef.current;
            if (!canvas) return { x: 0, y: 0 };
            const rect = canvas.getBoundingClientRect();

            let clientX, clientY;
            // Check for native TouchEvent or React TouchEvent
            if ('touches' in e && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else if ('clientX' in e) {
                // MouseEvent
                clientX = e.clientX;
                clientY = e.clientY;
            } else {
                return { x: 0, y: 0 };
            }

            return {
                x: (clientX - rect.left) / scale,
                y: (clientY - rect.top) / scale
            };
        };

        const startAction = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
            if (disabled) return;

            if (mode === 'move') {
                setIsDragging(true);
                let clientX, clientY;
                if ('touches' in e && e.touches.length > 0) {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                } else if ('clientX' in e) {
                    clientX = (e as MouseEvent).clientX;
                    clientY = (e as MouseEvent).clientY;
                } else {
                    return;
                }
                setDragStart({ x: clientX - position.x, y: clientY - position.y });
            } else {
                // Allow drawing with mouse or single touch
                const isMultiTouch = 'touches' in e && e.touches.length > 1;
                if (!isMultiTouch) {
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
                            ctx.lineWidth = 25 / scale;
                        } else {
                            ctx.globalCompositeOperation = 'source-over';
                            ctx.strokeStyle = '#ef4444'; // Red color
                            ctx.lineWidth = 4 / scale;
                        }
                    }
                }
            }
        };

        const moveAction = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
            if (disabled) return;

            if (mode === 'move' && isDragging) {
                let clientX, clientY;
                if ('touches' in e && e.touches.length > 0) {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                } else if ('clientX' in e) {
                    clientX = (e as MouseEvent).clientX;
                    clientY = (e as MouseEvent).clientY;
                } else {
                    return;
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
            setLastTouchDistance(null);
        };

        const clearDrawing = () => {
            const ctx = drawingCanvasRef.current?.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
        };

        const handleZoom = (delta: number) => {
            setScale(prev => Math.min(Math.max(0.5, prev + delta), 4));
        };

        // Manual Event Listeners for Passive: false support (Crucial for blocking scroll on mobile)
        useEffect(() => {
            const canvas = drawingCanvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container) return;

            const preventDefaultAndHandle = (handler: (e: any) => void) => (e: Event) => {
                if (e.cancelable) e.preventDefault();
                handler(e);
            };

            const onTouchStart = preventDefaultAndHandle((e: TouchEvent) => {
                if (disabled) return;
                if (e.touches.length === 2) {
                    // Pinch zoom start
                    const distance = Math.hypot(
                        e.touches[0].pageX - e.touches[1].pageX,
                        e.touches[0].pageY - e.touches[1].pageY
                    );
                    setLastTouchDistance(distance);
                    setIsDrawing(false);
                    setIsDragging(false);
                } else {
                    startAction(e);
                }
            });

            const onTouchMove = preventDefaultAndHandle((e: TouchEvent) => {
                if (disabled) return;
                if (e.touches.length === 2 && lastTouchDistance !== null) {
                    // Pinch zoom move
                    const distance = Math.hypot(
                        e.touches[0].pageX - e.touches[1].pageX,
                        e.touches[0].pageY - e.touches[1].pageY
                    );
                    const delta = (distance - lastTouchDistance) * 0.005;
                    handleZoom(delta);
                    setLastTouchDistance(distance);
                } else {
                    moveAction(e);
                }
            });

            const onTouchEnd = preventDefaultAndHandle(() => {
                stopAction();
            });

            // Wheel Handler for Container
            const onWheel = (e: WheelEvent) => {
                if (disabled) return;
                e.preventDefault(); // Prevent page scroll
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                handleZoom(delta);
            };

            // Attach listeners with passive: false
            canvas.addEventListener('touchstart', onTouchStart, { passive: false });
            canvas.addEventListener('touchmove', onTouchMove, { passive: false });
            canvas.addEventListener('touchend', onTouchEnd, { passive: false });
            canvas.addEventListener('touchcancel', onTouchEnd, { passive: false });
            container.addEventListener('wheel', onWheel, { passive: false });

            return () => {
                canvas.removeEventListener('touchstart', onTouchStart);
                canvas.removeEventListener('touchmove', onTouchMove);
                canvas.removeEventListener('touchend', onTouchEnd);
                canvas.removeEventListener('touchcancel', onTouchEnd);
                container.removeEventListener('wheel', onWheel);
            };
        }, [disabled, lastTouchDistance, mode, isDragging, isDrawing, position, scale, dragStart, canvasSize]);

        return (
            <div className={cn("flex flex-col items-center gap-3 w-full", className)} ref={containerRef}>
                {/* Toolbar - Optimized for Mobile - Sticky on mobile */}
                <div className="sticky top-0 z-10 md:static flex flex-wrap gap-3 p-3 bg-slate-100 rounded-2xl w-full justify-center shadow-inner">

                    {/* Drawing Tools */}
                    <div className="flex gap-2 p-1 bg-white rounded-xl shadow-sm">
                        <Button
                            type="button"
                            variant={mode === 'pen' ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => setMode('pen')}
                            disabled={disabled}
                            className="w-10 h-10 rounded-lg"
                            title="그리기 (Pen)"
                        >
                            <Pen className="w-5 h-5" />
                        </Button>
                        <Button
                            type="button"
                            variant={mode === 'eraser' ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => setMode('eraser')}
                            disabled={disabled}
                            className="w-10 h-10 rounded-lg"
                            title="지우개 (Eraser)"
                        >
                            <Eraser className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="w-px bg-slate-300 mx-1"></div>

                    {/* Navigation Tools */}
                    <div className="flex gap-2 p-1 bg-white rounded-xl shadow-sm">
                        <Button
                            type="button"
                            variant={mode === 'move' ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => setMode('move')}
                            disabled={disabled}
                            className="w-10 h-10 rounded-lg"
                            title="이동 (Move)"
                        >
                            <Hand className="w-5 h-5" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleZoom(0.2)}
                            disabled={disabled}
                            className="w-10 h-10 rounded-lg"
                        >
                            <ZoomIn className="w-5 h-5" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleZoom(-0.2)}
                            disabled={disabled}
                            className="w-10 h-10 rounded-lg"
                        >
                            <ZoomOut className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="w-px bg-slate-300 mx-1"></div>

                    {/* Actions */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearDrawing}
                        disabled={disabled}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 h-12 px-3 rounded-xl"
                    >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        <span className="text-xs font-semibold">초기화</span>
                    </Button>
                </div>

                {/* Canvas Container */}
                <div
                    className="relative border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm select-none touch-none w-full flex items-center justify-center bg-slate-100"
                    style={{
                        height: canvasSize.height,
                        cursor: mode === 'move' ? (isDragging ? 'grabbing' : 'grab') : 'crosshair',
                        touchAction: 'none'
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <div
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transformOrigin: '0 0',
                            width: canvasSize.width,
                            height: canvasSize.height,
                            touchAction: 'none',
                            position: 'relative'
                        }}
                    >
                        {/* Background Image */}
                        {backgroundImage && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={backgroundImage}
                                alt="background"
                                className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0 touch-none select-none p-12"
                                draggable={false}
                                onLoad={handleImageLoad}
                            />
                        )}

                        {/* Drawing Canvas */}
                        <canvas
                            ref={drawingCanvasRef}
                            width={canvasSize.width}
                            height={canvasSize.height}
                            onMouseDown={startAction}
                            onMouseMove={moveAction}
                            onMouseUp={stopAction}
                            onMouseLeave={stopAction}
                            className="absolute inset-0 z-10 touch-none"
                            draggable={false}
                        />
                    </div>
                </div>

                <div className="text-center text-[10px] sm:text-xs text-slate-400 bg-slate-50 py-1.5 px-4 rounded-full border border-slate-100 shadow-sm animate-in fade-in duration-500">
                    {mode === 'move'
                        ? '👆 드래그하여 이동하거나 휠/핀치로 확대하세요'
                        : '✏️ 자유롭게 그리세요 | ✌️ 두 손가락으로 확대/이동 가능'}
                    <span className="ml-2 font-mono opacity-50">| {Math.round(scale * 100)}%</span>
                </div>
            </div >
        );
    }
);

SketchCanvas.displayName = 'SketchCanvas';
