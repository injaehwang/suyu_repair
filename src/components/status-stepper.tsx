'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { STATUS_STEPS, STATUS_LABELS } from '@/lib/constants';
import { Check, Circle } from 'lucide-react';

interface StatusStepperProps {
    currentStatus: string;
}

export default function StatusStepper({ currentStatus }: StatusStepperProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const activeStepIndex = STATUS_STEPS.indexOf(currentStatus);

    useEffect(() => {
        if (scrollRef.current && activeStepIndex !== -1) {
            const stepElement = scrollRef.current.children[0].children[activeStepIndex] as HTMLElement;
            if (stepElement) {
                // Scroll to center the active step
                const containerWidth = scrollRef.current.offsetWidth;
                const stepLeft = stepElement.offsetLeft;
                const stepWidth = stepElement.offsetWidth;

                scrollRef.current.scrollTo({
                    left: stepLeft - containerWidth / 2 + stepWidth / 2,
                    behavior: 'smooth'
                });
            }
        }
    }, [activeStepIndex]);

    return (
        <div className="w-full py-4 relative">
            {/* Gradient masks for scroll indication */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            <div
                ref={scrollRef}
                className="overflow-x-auto hide-scrollbar w-full px-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <div className="flex items-start min-w-max gap-0 relative pt-2 pb-6">
                    {/* Progress Bar Background */}
                    <div className="absolute top-[15px] left-0 w-full h-0.5 bg-slate-100 -z-10" />

                    {/* Active Progress Bar */}
                    <div
                        className="absolute top-[15px] left-0 h-0.5 bg-blue-600 -z-10 transition-all duration-500"
                        style={{ width: `${(activeStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                    />

                    {STATUS_STEPS.map((step, index) => {
                        const isCompleted = index <= activeStepIndex;
                        const isCurrent = index === activeStepIndex;
                        const label = STATUS_LABELS[step as keyof typeof STATUS_LABELS];

                        return (
                            <div key={step} className="flex flex-col items-center w-20 flex-shrink-0 group">
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-0 bg-white",
                                        isCompleted
                                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
                                            : "border-slate-200 text-slate-300"
                                    )}
                                >
                                    {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : <Circle className="w-2 h-2 fill-current" />}
                                </div>
                                <span
                                    className={cn(
                                        "mt-3 text-[10px] font-bold text-center px-1 transition-colors duration-300 whitespace-nowrap",
                                        isCurrent ? "text-blue-600 scale-110" : "text-slate-400"
                                    )}
                                >
                                    {label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
