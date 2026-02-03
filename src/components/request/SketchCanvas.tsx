'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle, useLayoutEffect } from 'react';
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
    ({ backgroundImage, width: initialWidth, height: initialHeight, className, disabled = false }, ref) => {
        // Container refs
        const containerRef = useRef<HTMLDivElement>(null);

        // Canvas refs
        // Removed backgroundCanvasRef, replaced with imgRef
        const drawingCanvasRef = useRef<HTMLCanvasElement>(null);

        // State
        const [mode, setMode] = useState<Tool>('pen');
        const [isDrawing, setIsDrawing] = useState(false);
        const [scale, setScale] = useState(1);
        const [position, setPosition] = useState({ x: 0, y: 0 });
        const [isDragging, setIsDragging] = useState(false);
        const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
        const [canvasSize, setCanvasSize] = useState({ width: initialWidth || 600, height: initialHeight || 500 });

        // Pinch Zoom State
        const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);

        // Image Ref for saving
        const imgRef = useRef<HTMLImageElement | null>(null);

        // Responsive sizing
        useLayoutEffect(() => {
            const updateSize = () => {
                if (containerRef.current) {
                    const width = containerRef.current.offsetWidth;
                    // Keep aspect ratio or use fixed height on desktop
                    const height = window.innerWidth < 768 ? width * 1.2 : (initialHeight || 500);
                    setCanvasSize({ width, height });
                }
            };

            updateSize();
            window.addEventListener('resize', updateSize);
            return () => window.removeEventListener('resize', updateSize);
        }, [initialHeight]);

        useImperativeHandle(ref, () => ({
            getCanvasData: () => {
                // Return just the drawing layer merged with background
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvasSize.width;
                tempCanvas.height = canvasSize.height;
                const ctx = tempCanvas.getContext('2d');
                if (!ctx) return '';

                // Draw Background Image (Manual 'contain' logic to match CSS object-fit: contain)
                if (imgRef.current) {
                    const img = imgRef.current;
                    const w = canvasSize.width;
                    const h = canvasSize.height;
                    // Avoid division by zero
                    if (img.naturalWidth && img.naturalHeight) {
                        const scaleFactor = Math.min(w / img.naturalWidth, h / img.naturalHeight);
                        const x = (w / 2) - (img.naturalWidth / 2) * scaleFactor;
                        const y = (h / 2) - (img.naturalHeight / 2) * scaleFactor;
                        ctx.drawImage(img, x, y, img.naturalWidth * scaleFactor, img.naturalHeight * scaleFactor);
                    }
                }

                // Draw drawing
                if (drawingCanvasRef.current) {
                    ctx.drawImage(drawingCanvasRef.current, 0, 0);
                }

                return tempCanvas.toDataURL('image/png');
            }
        }));

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
            } else if (e.nativeEvent instanceof MouseEvent || ('touches' in e && e.touches.length === 1)) {
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
                        ctx.lineWidth = 20 / scale;
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
            if (ctx) ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
        };

        const handleZoom = (delta: number) => {
            setScale(prev => Math.min(Math.max(0.5, prev + delta), 4));
        };

        // Manual Event Listeners for Passive: false support
        useEffect(() => {
            const canvas = drawingCanvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container) return;

            // Touch Handlers for Canvas (Drawing/Pinch)
            const preventDefaultAndHandle = (handler: (e: TouchEvent) => void) => (e: TouchEvent) => {
                // We MUST prevent default to stop scrolling and native image dragging
                if (e.cancelable) e.preventDefault();
                handler(e);
            };

            const onTouchStart = preventDefaultAndHandle((e: TouchEvent) => {
                // Need to adapt TouchEvent to React.TouchEvent signature or just use native logic
                // Re-implementing logic for native event
                if (disabled) return;
                if (e.touches.length === 2) {
                    const distance = Math.hypot(
                        e.touches[0].pageX - e.touches[1].pageX,
                        e.touches[0].pageY - e.touches[1].pageY
                    );
                    setLastTouchDistance(distance);
                    setIsDrawing(false);
                    setIsDragging(false);
                } else {
                    startAction(e as unknown as React.TouchEvent);
                }
            });

            const onTouchMove = preventDefaultAndHandle((e: TouchEvent) => {
                if (disabled) return;
                if (e.touches.length === 2 && lastTouchDistance !== null) {
                    const distance = Math.hypot(
                        e.touches[0].pageX - e.touches[1].pageX,
                        e.touches[0].pageY - e.touches[1].pageY
                    );
                    const delta = (distance - lastTouchDistance) * 0.01;
                    handleZoom(delta);
                    setLastTouchDistance(distance);
                } else {
                    // moveAction(e as unknown as React.TouchEvent);
                }
            });

            const onTouchEnd = preventDefaultAndHandle(() => {
                setLastTouchDistance(null);
                // stopAction();
            });

            // Wheel Handler for Container
            const onWheel = (e: WheelEvent) => {
                if (disabled) return;
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                handleZoom(delta);
            };

            // Attach listeners
            // Use { passive: false } to allow blocking default behavior
            canvas.addEventListener('touchstart', onTouchStart, { passive: false });
            canvas.addEventListener('touchmove', onTouchMove, { passive: false });
            canvas.addEventListener('touchend', onTouchEnd, { passive: false });
            container.addEventListener('wheel', onWheel, { passive: false });

            return () => {
                canvas.removeEventListener('touchstart', onTouchStart);
                canvas.removeEventListener('touchmove', onTouchMove);
                canvas.removeEventListener('touchend', onTouchEnd);
                container.removeEventListener('wheel', onWheel);
            };
        }, [disabled, lastTouchDistance, mode, isDragging, isDrawing, position, scale, dragStart]); // Dependencies for closure freshness


        return (
            <div className={cn("flex flex-col items-center gap-4 w-full", className)} ref={containerRef}>
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
                            onClick={() => handleZoom(0.2)}
                            disabled={disabled}
                        >
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleZoom(-0.2)}
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
                    className="relative border-2 border-slate-200 rounded-lg overflow-hidden bg-slate-200 shadow-inner select-none touch-none"
                    style={{
                        width: '100%',
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
                            position: 'relative' // Explicit positioning context
                        }}
                    >
                        {/* Background Image (Standard IMG tag) */}
                        {backgroundImage && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={backgroundImage}
                                alt="background"
                                className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0 touch-none select-none"
                                draggable={false}
                                onLoad={(e) => { imgRef.current = e.currentTarget; }}
                            />
                        )}

                        {/* Drawing Canvas (Transparent Layer) */}
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
                <div className="text-center text-[11px] text-slate-500 bg-slate-50 py-1 px-3 rounded-full border border-slate-100">
                    {mode === 'move'
                        ? '드래그: 이동 | 휠/핀치: 확대'
                        : '한손가락: 그리기 | 두손가락: 확대/이동'} | {Math.round(scale * 100)}%
                </div>
            </div>
        );
    }
);

SketchCanvas.displayName = 'SketchCanvas';
