'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, ZoomIn, ZoomOut, Hand, MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SketchCanvasProps {
    backgroundImage: string | null;
    width?: number;
    height?: number;
    className?: string;
    disabled?: boolean;
    initialDrawing?: string | null; // We can ignore this or try to parse points if we saved them as JSON, but for now we might lose old drawings.
}

export interface SketchCanvasHandle {
    getCanvasData: () => string;
    getDrawingData: () => string; // Returns points JSON string
}

type Tool = 'mark' | 'move';

interface Point {
    id: number;
    x: number; // percent 0-100 relative to image width
    y: number; // percent 0-100 relative to image height
}

export const SketchCanvas = forwardRef<SketchCanvasHandle, SketchCanvasProps>(
    ({ backgroundImage, width: initialWidth, height: initialHeight, className, disabled = false, initialDrawing }, ref) => {
        // Container refs
        const containerRef = useRef<HTMLDivElement>(null);

        // State
        const [mode, setMode] = useState<Tool>('mark');
        const [points, setPoints] = useState<Point[]>([]);

        const [scale, setScale] = useState(1);
        const [position, setPosition] = useState({ x: 0, y: 0 });
        const [isDragging, setIsDragging] = useState(false);
        const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

        // Canvas size state (display size)
        const [canvasSize, setCanvasSize] = useState({ width: initialWidth || 600, height: initialHeight || 500 });
        const [imageLoaded, setImageLoaded] = useState(false);

        // Touch state
        const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);

        // Image Ref for dimensions
        const imgRef = useRef<HTMLImageElement | null>(null);

        // Constants
        const CANVAS_PADDING = 48;

        // Load initial points
        useEffect(() => {
            if (initialDrawing) {
                try {
                    const parsed = JSON.parse(initialDrawing);
                    if (Array.isArray(parsed)) {
                        setPoints(parsed);
                    }
                } catch (e) {
                    // Ignore invalid JSON (legacy image data)
                }
            }
        }, [initialDrawing]);

        // Calculate and lock aspect ratio based on image
        const updateCanvasSize = () => {
            if (!containerRef.current || !imgRef.current) return;

            const containerW = containerRef.current.offsetWidth;
            const isMobile = window.innerWidth < 768;
            const maxH = isMobile
                ? Math.min(window.innerHeight * 0.65, 500)
                : window.innerHeight * 0.7;

            const scrollGutter = isMobile ? 48 : 0;
            const imgW = imgRef.current.naturalWidth || 1;
            const imgH = imgRef.current.naturalHeight || 1;

            const availableW = Math.max(10, containerW - scrollGutter);

            // Fit logic
            let contentW = Math.max(10, availableW - (CANVAS_PADDING * 2));
            let contentH = contentW * (imgH / imgW);

            let finalW = contentW + (CANVAS_PADDING * 2);
            let finalH = contentH + (CANVAS_PADDING * 2);

            if (finalH > maxH) {
                finalH = maxH;
                contentH = Math.max(10, finalH - (CANVAS_PADDING * 2));
                contentW = contentH * (imgW / imgH);
                finalW = contentW + (CANVAS_PADDING * 2);
            }

            setCanvasSize({ width: finalW, height: finalH });
        };

        const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
            imgRef.current = e.currentTarget;
            setImageLoaded(true);
            updateCanvasSize();
        };

        useEffect(() => {
            window.addEventListener('resize', updateCanvasSize);
            return () => window.removeEventListener('resize', updateCanvasSize);
        }, [imageLoaded]);

        useImperativeHandle(ref, () => ({
            getCanvasData: () => {
                // Export Logic: Draw Image + Points onto a temporary canvas
                if (!imgRef.current) return '';

                const img = imgRef.current;
                const naturalW = img.naturalWidth;
                const naturalH = img.naturalHeight;

                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = naturalW;
                tempCanvas.height = naturalH;
                const ctx = tempCanvas.getContext('2d');
                if (!ctx) return '';

                // Draw Background Image (Full Resolution)
                ctx.drawImage(img, 0, 0, naturalW, naturalH);

                // Draw Points - Pin Style
                // Size needs to scale relative to image size
                const pinSize = Math.max(naturalW, naturalH) * 0.05; // 5% of image size
                const pinW = pinSize;
                const pinH = pinSize;

                points.forEach(p => {
                    const cx = (p.x / 100) * naturalW;
                    const cy = (p.y / 100) * naturalH;

                    // Draw MapPin Path matches Lucide Icon
                    // Tip is at (cx, cy)
                    // Pin is centered horizontally at cx, and stands ABOVE cy

                    ctx.save();
                    ctx.translate(cx, cy);
                    ctx.scale(pinW / 24, pinH / 24); // Lucide default viewport is 24x24
                    ctx.translate(-12, -24); // Move so (12, 24) is at (0,0) - i.e. tip at origin

                    // MapPin Path from Lucide source
                    // <path d="M20 10c0 6-8 13-8 13s-8-7-8-13a8 8 0 0 1 16 0Z" />
                    // <circle cx="12" cy="10" r="3" />

                    // Shadow
                    ctx.shadowColor = "rgba(0,0,0,0.3)";
                    ctx.shadowBlur = 4;
                    ctx.shadowOffsetY = 2;

                    // Main Pin Body
                    ctx.beginPath();
                    // M 20 10 -> C 0 6 ...
                    // We can use SVG Path2D if supported, but let's just draw manually for compatibility
                    // M20,10 c0,6 -8,13 -8,13 s-8,-7 -8,-13 a8,8 0 0,1 16,0 Z

                    // Simplified Pin Shape
                    // Circle head
                    ctx.lineWidth = 2; // Relative to 24px scale
                    ctx.strokeStyle = '#ffffff';
                    ctx.fillStyle = '#ef4444';

                    const pPath = new Path2D("M20 10c0 6-8 13-8 13s-8-7-8-13a8 8 0 0 1 16 0Z");
                    ctx.fill(pPath);
                    ctx.stroke(pPath);

                    // Inner Dot
                    ctx.beginPath();
                    ctx.arc(12, 10, 3, 0, 2 * Math.PI);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();

                    ctx.restore();
                });

                return tempCanvas.toDataURL('image/jpeg', 0.85);
            },
            getDrawingData: () => {
                return JSON.stringify(points);
            }
        }));

        // Interaction Handlers
        const getRelativeCoords = (clientX: number, clientY: number) => {
            if (!imgRef.current) return null;

            // Get the image element's position relative to the viewport
            // Calculate click position relative to the image element
            // We need to account for CANVAS_PADDING because the markers are rendered inside the padded area
            const x = clientX - rect.left - CANVAS_PADDING;
            const y = clientY - rect.top - CANVAS_PADDING;
            const contentWidth = rect.width - (CANVAS_PADDING * 2);
            const contentHeight = rect.height - (CANVAS_PADDING * 2);

            // Calculate percentage relative to the CONTENT area
            let xPercent = (x / contentWidth) * 100;
            let yPercent = (y / contentHeight) * 100;

            // Clamp to 0-100% to ensure markers stay within bounds even if clicked slightly in the padding
            xPercent = Math.max(0, Math.min(100, xPercent));
            yPercent = Math.max(0, Math.min(100, yPercent));

            return {
                x: xPercent,
                y: yPercent
            };
        };

        const handlePointerDown = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
            if (disabled) return;

            // Check if we clicked on an existing marker
            const target = e.target as HTMLElement;
            if (target.closest('[data-marker="true"]')) {
                return;
            }

            let clientX, clientY;
            if ('touches' in e && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else if ('clientX' in e) {
                clientX = (e as React.MouseEvent).clientX;
                clientY = (e as React.MouseEvent).clientY;
            } else {
                return;
            }

            if (mode === 'move') {
                setIsDragging(true);
                setDragStart({ x: clientX - position.x, y: clientY - position.y });
            } else {
                // Mark Mode: Add Point
                const coords = getRelativeCoords(clientX, clientY);
                if (coords) {
                    setPoints(prev => [...prev, { id: Date.now(), x: coords.x, y: coords.y }]);
                }
            }
        };

        const handlePointerMove = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
            if (disabled) return;

            if (mode === 'move' && isDragging) {
                let clientX, clientY;
                if ('touches' in e && e.touches.length > 0) {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                } else if ('clientX' in e) {
                    clientX = (e as React.MouseEvent).clientX;
                    clientY = (e as React.MouseEvent).clientY;
                } else {
                    return;
                }
                setPosition({
                    x: clientX - dragStart.x,
                    y: clientY - dragStart.y
                });
            }
        };

        const handlePointerUp = () => {
            setIsDragging(false);
            setLastTouchDistance(null);
        };

        const handleZoom = (delta: number) => {
            setScale(prev => Math.min(Math.max(1, prev + delta), 4));
        };

        const deletePoint = (id: number, e: React.MouseEvent | React.TouchEvent) => {
            e.stopPropagation();
            setPoints(prev => prev.filter(p => p.id !== id));
        };

        // Manual Event Listeners (copied from previous implementation for passive: false)
        useEffect(() => {
            const container = containerRef.current;
            // Ideally we attach to a wrapper around the image to capture all events
            const wrapper = container?.querySelector('.canvas-wrapper') as HTMLElement;

            if (!wrapper) return;

            const preventDefaultAndHandle = (handler: (e: any) => void) => (e: Event) => {
                if (e.cancelable) e.preventDefault();
                handler(e);
            };

            const onTouchStart = preventDefaultAndHandle((e: TouchEvent) => {
                if (disabled) return;
                if (e.touches.length === 2) {
                    const distance = Math.hypot(
                        e.touches[0].pageX - e.touches[1].pageX,
                        e.touches[0].pageY - e.touches[1].pageY
                    );
                    setLastTouchDistance(distance);
                    setIsDragging(false);
                } else {
                    handlePointerDown(e);
                }
            });

            const onTouchMove = preventDefaultAndHandle((e: TouchEvent) => {
                if (disabled) return;
                if (e.touches.length === 2 && lastTouchDistance !== null) {
                    const distance = Math.hypot(
                        e.touches[0].pageX - e.touches[1].pageX,
                        e.touches[0].pageY - e.touches[1].pageY
                    );
                    const delta = (distance - lastTouchDistance) * 0.005;
                    handleZoom(delta);
                    setLastTouchDistance(distance);
                } else {
                    handlePointerMove(e);
                }
            });

            const onTouchEnd = preventDefaultAndHandle(() => {
                handlePointerUp();
            });

            wrapper.addEventListener('touchstart', onTouchStart, { passive: false });
            wrapper.addEventListener('touchmove', onTouchMove, { passive: false });
            wrapper.addEventListener('touchend', onTouchEnd, { passive: false });

            return () => {
                wrapper.removeEventListener('touchstart', onTouchStart);
                wrapper.removeEventListener('touchmove', onTouchMove);
                wrapper.removeEventListener('touchend', onTouchEnd);
            };
        }, [disabled, lastTouchDistance, mode, isDragging, position, scale, dragStart]);


        return (
            <div className={cn("flex flex-col items-center gap-3 w-full", className)} ref={containerRef}>
                {/* Toolbar */}
                <div className="sticky top-0 z-10 md:static flex flex-wrap gap-3 p-3 bg-slate-100 rounded-2xl w-full justify-center shadow-inner">
                    <div className="flex gap-2 p-1 bg-white rounded-xl shadow-sm">
                        <Button
                            type="button"
                            variant={mode === 'mark' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setMode('mark')}
                            disabled={disabled}
                            className="h-10 px-4 rounded-lg flex gap-2"
                        >
                            <MapPin className="w-5 h-5" />
                            <span className="text-xs font-bold">마커 추가</span>
                        </Button>
                        <Button
                            type="button"
                            variant={mode === 'move' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setMode('move')}
                            disabled={disabled}
                            className="h-10 px-4 rounded-lg flex gap-2"
                        >
                            <Hand className="w-5 h-5" />
                            <span className="text-xs font-bold">이동/확대</span>
                        </Button>
                    </div>

                    <div className="w-px bg-slate-300 mx-1"></div>

                    <div className="flex gap-2 p-1 bg-white rounded-xl shadow-sm">
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
                </div>

                {/* Canvas Area */}
                <div
                    className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-100 shadow-sm select-none w-full flex items-center justify-center cursor-crosshair overflow-hidden"
                    style={{
                        height: canvasSize.height,
                        cursor: mode === 'move' ? (isDragging ? 'grabbing' : 'grab') : 'copy',
                    }}
                >
                    {/* Inner Wrapper for Transforms */}
                    <div
                        className="canvas-wrapper relative"
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transformOrigin: '0 0',
                            width: canvasSize.width,
                            height: canvasSize.height,
                            touchAction: 'none'
                        }}
                        onMouseDown={handlePointerDown}
                        onMouseMove={handlePointerMove}
                        onMouseUp={handlePointerUp}
                        onMouseLeave={handlePointerUp}
                    >
                        {backgroundImage && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={backgroundImage}
                                alt="back"
                                className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
                                style={{ padding: CANVAS_PADDING }}
                                draggable={false}
                                onLoad={handleImageLoad}
                            />
                        )}

                        {/* Rendering Points Overlay (Only on top of image) */}
                        {/* We need to render points RELATIVE to the image content area, not the full canvas with padding. */}
                        {/* Actually, I implemented coords relative to the IMAGE element. So we need to position a container exactly over the image. */}

                        {backgroundImage && imageLoaded && (
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{ padding: CANVAS_PADDING }} // Match image padding
                            >
                                <div className="relative w-full h-full">
                                    {/* This div matches the IMAGE content dimensions */}
                                    {points.map(p => (
                                        <div
                                            key={p.id}
                                            data-marker="true"
                                            className="absolute -translate-x-1/2 -translate-y-full pointer-events-auto cursor-pointer hover:scale-110 transition-transform origin-bottom z-10"
                                            style={{ left: `${p.x}%`, top: `${p.y}%` }}
                                            onClick={(e) => deletePoint(p.id, e)}
                                            onTouchEnd={(e) => deletePoint(p.id, e)}
                                        >
                                            <div className="relative group flex flex-col items-center">
                                                {/* Pin Icon */}
                                                <MapPin
                                                    className="w-8 h-8 md:w-10 md:h-10 text-red-500 drop-shadow-md filter"
                                                    fill="#ef4444"
                                                    stroke="#ffffff"
                                                    strokeWidth={2}
                                                />

                                                {/* Tooltip */}
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                    삭제하려면 터치
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                <div className="mt-3 text-center text-[10px] sm:text-xs text-slate-400 bg-slate-50 py-1.5 px-4 rounded-full border border-slate-100 shadow-sm animate-in fade-in duration-500">
                    {mode === 'move'
                        ? '👆 드래그하여 이동하거나 휠/핀치로 확대하세요'
                        : '📍 수선이 필요한 위치를 터치하여 핀을 꽂아주세요 (삭제하려면 핀 터치)'}
                </div>
            </div>
        );
    }
);

SketchCanvas.displayName = 'SketchCanvas';
