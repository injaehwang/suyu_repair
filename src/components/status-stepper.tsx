'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { STATUS_STEPS, STATUS_LABELS } from '@/lib/constants';
import {
    FileText, Calculator, CreditCard, CheckCircle,
    Package, Truck, MapPin, Scissors,
    Shirt, Home, Star
} from 'lucide-react';

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

    const getIcon = (step: string) => {
        switch (step) {
            case 'REQUESTED': return FileText;
            case 'ESTIMATE_COMPLETED': return Calculator;
            case 'PAYMENT_PENDING': return CreditCard;
            case 'PAYMENT_COMPLETED': return CheckCircle;
            case 'PICKUP_REQUESTED': return Package;
            case 'PICKUP_COMPLETED': return Truck;
            case 'ARRIVED': return MapPin;
            case 'REPAIRING': return Scissors;
            case 'REPAIR_COMPLETED': return Shirt;
            case 'DELIVERY_STARTED': return Truck;
            case 'DELIVERY_COMPLETED': return Home;
            case 'COMPLETED': return Star;
            default: return FileText;
        }
    };

    return (
        <div className="w-full py-6 relative">
            {/* Gradient masks for scroll indication */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            <div
                ref={scrollRef}
                className="overflow-x-auto hide-scrollbar w-full px-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <div className="flex items-start min-w-max gap-3 relative pt-2 pb-6 px-4">
                    {/* Background Line */}
                    <div className="absolute top-[26px] left-0 w-full h-[3px] bg-slate-100 -z-10" />

                    {/* Active Progress Line */}
                    <div
                        className="absolute top-[26px] left-0 h-[3px] bg-blue-600 -z-10 transition-all duration-700 ease-out"
                        style={{ width: `${Math.max(0, (activeStepIndex / (STATUS_STEPS.length - 1)) * 100)}%` }}
                    />

                    {STATUS_STEPS.map((step, index) => {
                        const isCompleted = index <= activeStepIndex;
                        const isCurrent = index === activeStepIndex;
                        const Icon = getIcon(step);
                        const label = STATUS_LABELS[step as keyof typeof STATUS_LABELS];

                        return (
                            <div key={step} className="flex flex-col items-center w-20 flex-shrink-0 group cursor-default">
                                <div
                                    className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center border-[3px] transition-all duration-300 z-0",
                                        isCompleted
                                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                                            : "bg-white border-slate-200 text-slate-300",
                                        isCurrent && "scale-110 ring-4 ring-blue-100"
                                    )}
                                >
                                    <Icon className={cn("w-6 h-6", isCurrent && "animate-pulse-subtle")} strokeWidth={isCompleted ? 2.5 : 2} />
                                </div>
                                <span
                                    className={cn(
                                        "mt-3 text-[11px] font-bold text-center px-1 transition-colors duration-300 whitespace-nowrap",
                                        isCurrent ? "text-blue-600" : isCompleted ? "text-slate-600" : "text-slate-300"
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
