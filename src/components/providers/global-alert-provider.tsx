'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AlertOptions {
    title?: string;
    confirmLabel?: string;
    variant?: 'default' | 'destructive';
}

interface ConfirmOptions {
    title?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'destructive';
}

interface GlobalAlertContextType {
    alert: (message: React.ReactNode, options?: AlertOptions) => Promise<void>;
    confirm: (message: React.ReactNode, options?: ConfirmOptions) => Promise<boolean>;
}

const GlobalAlertContext = createContext<GlobalAlertContextType | undefined>(undefined);

export function useAlert() {
    const context = useContext(GlobalAlertContext);
    if (!context) {
        throw new Error('useAlert must be used within a GlobalAlertProvider');
    }
    return context;
}

export function GlobalAlertProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<{
        type: 'alert' | 'confirm';
        message: React.ReactNode;
        title?: string;
        confirmLabel?: string;
        cancelLabel?: string;
        variant?: 'default' | 'destructive';
    } | null>(null);

    const resolveRef = useRef<(value: any) => void>(() => { });

    const alert = useCallback((message: React.ReactNode, options?: AlertOptions) => {
        return new Promise<void>((resolve) => {
            setConfig({
                type: 'alert',
                message,
                title: options?.title || '알림',
                confirmLabel: options?.confirmLabel || '확인',
                variant: options?.variant || 'default',
            });
            resolveRef.current = resolve;
            setIsOpen(true);
        });
    }, []);

    const confirm = useCallback((message: React.ReactNode, options?: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            setConfig({
                type: 'confirm',
                message,
                title: options?.title || '확인',
                confirmLabel: options?.confirmLabel || '확인',
                cancelLabel: options?.cancelLabel || '취소',
                variant: options?.variant || 'default',
            });
            resolveRef.current = resolve;
            setIsOpen(true);
        });
    }, []);

    const handleConfirm = () => {
        setIsOpen(false);
        if (config?.type === 'confirm') {
            resolveRef.current(true);
        } else {
            resolveRef.current(undefined);
        }
    };

    const handleCancel = () => {
        setIsOpen(false);
        if (config?.type === 'confirm') {
            resolveRef.current(false);
        } else {
            resolveRef.current(undefined);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            handleCancel();
        }
    };

    return (
        <GlobalAlertContext.Provider value={{ alert, confirm }}>
            {children}
            {config && (
                <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                    <DialogContent className="sm:max-w-[425px] rounded-2xl p-6 gap-6">
                        <DialogHeader className="space-y-3 text-center sm:text-left">
                            <DialogTitle className="text-xl font-bold text-slate-900">
                                {config.title}
                            </DialogTitle>
                            <DialogDescription className="text-slate-600 text-base leading-relaxed whitespace-pre-line" asChild>
                                <div>{config.message}</div>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex-row gap-3 sm:space-x-0">
                            {config.type === 'confirm' && (
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="flex-1 h-11 rounded-xl font-medium border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                                >
                                    {config.cancelLabel}
                                </Button>
                            )}
                            <Button
                                onClick={handleConfirm}
                                className={`flex-1 h-11 rounded-xl font-bold shadow-md ${config.variant === 'destructive'
                                    ? 'bg-red-500 hover:bg-red-600 shadow-red-100'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                                    }`}
                            >
                                {config.confirmLabel}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </GlobalAlertContext.Provider>
    );
}
