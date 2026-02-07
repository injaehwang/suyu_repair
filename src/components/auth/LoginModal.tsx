'use client';

import { signIn } from 'next-auth/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: React.ReactNode;
}

export function LoginModal({ isOpen, onClose, title, description }: LoginModalProps) {
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleLogin = async (provider: 'google' | 'naver') => {
        setIsLoading(provider);
        try {
            await signIn(provider, { callbackUrl: '/' });
        } catch (error) {
            console.error(error);
        } finally {
            // Usually redirects, but clear loading if cancelled or failed fast
            setTimeout(() => setIsLoading(null), 1000);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[90%] sm:w-full sm:max-w-md bg-white p-0 gap-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
                <div className="p-8 pt-10 text-center">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-lg md:text-xl font-bold text-center mb-2 text-slate-800 break-keep">
                            {title || "로그인이 필요해요"}
                        </DialogTitle>
                        <DialogDescription className="text-center text-sm text-slate-600 break-keep">
                            {description || "3초 만에 소셜 계정으로 간편하게 시작해보세요!"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        {/* Google Button */}
                        <Button
                            variant="outline"
                            className="w-full h-14 rounded-full border-slate-200 hover:bg-slate-50 justify-center px-6 gap-3 text-slate-700 font-medium relative overflow-hidden group transition-all"
                            onClick={() => handleLogin('google')}
                            disabled={!!isLoading}
                        >
                            <div className="w-5 h-5 shrink-0 relative flex items-center justify-center">
                                {/* Google Icon */}
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            </div>
                            <span className="text-center">Google로 계속하기</span>
                            {isLoading === 'google' && (
                                <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </Button>

                        {/* Naver Button */}
                        <Button
                            className="w-full h-14 rounded-full bg-[#03C75A] hover:bg-[#02b351] text-white justify-center px-6 gap-3 font-bold relative overflow-hidden group transition-all"
                            onClick={() => handleLogin('naver')}
                            disabled={!!isLoading}
                        >
                            <div className="w-5 h-5 shrink-0 relative flex items-center justify-center">
                                {/* Naver Icon - Simplified White N */}
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white fill-current">
                                    <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
                                </svg>
                            </div>
                            <span className="text-center">Naver로 계속하기</span>
                            {isLoading === 'naver' && (
                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </Button>
                    </div>

                    <p className="mt-8 text-[11px] text-slate-400">
                        로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
