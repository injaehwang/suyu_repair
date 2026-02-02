'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperProps {
    steps: string[];
    currentStep: number; // 0-indexed
}

export function Stepper({ steps, currentStep }: StepperProps) {
    return (
        <div className="w-full">
            <div className="relative flex items-center justify-between">
                {/* Connecting Line - Background */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10" />

                {/* Connecting Line - Progress */}
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-900 -z-10 transition-all duration-300 ease-in-out"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    const isPending = index > currentStep;

                    return (
                        <div key={step} className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-300 bg-white",
                                    isCompleted ? "border-slate-900 bg-slate-900 text-white" : "",
                                    isCurrent ? "border-slate-900 text-slate-900" : "",
                                    isPending ? "border-slate-200 text-slate-300" : ""
                                )}
                            >
                                {isCompleted ? <Check className="h-4 w-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
                            </div>
                            <span
                                className={cn(
                                    "absolute top-10 text-[10px] sm:text-xs font-medium whitespace-nowrap transition-colors",
                                    index === currentStep ? "text-slate-900" : "text-slate-400"
                                )}
                                style={{
                                    // Simple positioning hack: only show label for current, first, last, or if there's space. 
                                    // For mobile, maybe just show current step text prominently elsewhere?
                                    // Let's hide non-active labels slightly or keep them if space allows.
                                    // For now, standard display.
                                }}
                            >
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
            {/* Mobile-friendly Text below */}
            <div className="mt-8 text-center sm:hidden">
                <p className="text-sm font-bold text-slate-900">{steps[currentStep]}</p>
            </div>
        </div>
    );
}
