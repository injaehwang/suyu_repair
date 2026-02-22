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

type ModalMode = 'login' | 'register';

export function LoginModal({ isOpen, onClose, title, description }: LoginModalProps) {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [mode, setMode] = useState<ModalMode>('login');
    const [error, setError] = useState<string | null>(null);

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [address, setAddress] = useState('');
    const [addressDetail, setAddressDetail] = useState('');

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setPasswordConfirm('');
        setName('');
        setPhone('');
        setZipCode('');
        setAddress('');
        setAddressDetail('');
        setError(null);
    };

    const handlePostcodeSearch = () => {
        if (typeof window === 'undefined' || !(window as any).daum || !(window as any).daum.Postcode) {
            setError('우편번호 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        new (window as any).daum.Postcode({
            oncomplete: function (data: any) {
                setZipCode(data.zonecode);
                setAddress(data.address);
            },
        }).open();
    };

    const switchMode = (newMode: ModalMode) => {
        resetForm();
        setMode(newMode);
    };

    const handleSocialLogin = async (provider: 'google' | 'naver') => {
        setIsLoading(provider);
        try {
            await signIn(provider, { callbackUrl: '/' });
        } catch (error) {
            console.error(error);
        } finally {
            setTimeout(() => setIsLoading(null), 1000);
        }
    };

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading('credentials');

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('이메일 또는 비밀번호가 올바르지 않습니다');
            } else {
                onClose();
                window.location.href = '/';
            }
        } catch (error) {
            setError('로그인 중 오류가 발생했습니다');
        } finally {
            setIsLoading(null);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== passwordConfirm) {
            setError('비밀번호가 일치하지 않습니다');
            return;
        }

        if (password.length < 8) {
            setError('비밀번호는 최소 8자 이상이어야 합니다');
            return;
        }

        setIsLoading('register');

        try {
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, phone: phone || undefined, zipCode: zipCode || undefined, address: address || undefined, addressDetail: addressDetail || undefined }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                if (response.status === 409) {
                    setError('이미 사용 중인 이메일입니다');
                } else {
                    setError(data?.message || '회원가입에 실패했습니다');
                }
                return;
            }

            // Auto login after successful registration
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('회원가입은 완료되었으나 자동 로그인에 실패했습니다. 로그인을 다시 시도해주세요.');
                switchMode('login');
            } else {
                onClose();
                window.location.href = '/';
            }
        } catch (error) {
            setError('회원가입 중 오류가 발생했습니다');
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[90%] sm:w-full sm:max-w-md bg-white p-0 gap-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
                <div className="p-8 pt-10 text-center">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-lg md:text-xl font-bold text-center mb-2 text-slate-800 break-keep">
                            {title || (mode === 'login' ? "로그인" : "회원가입")}
                        </DialogTitle>
                        <DialogDescription className="text-center text-sm text-slate-600 break-keep">
                            {description || (mode === 'login'
                                ? "이메일 또는 소셜 계정으로 로그인하세요"
                                : "이메일로 간편하게 가입하세요"
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Tab Switcher */}
                    <div className="flex bg-slate-100 rounded-full p-1 mb-6">
                        <button
                            type="button"
                            onClick={() => switchMode('login')}
                            className={cn(
                                "flex-1 py-2 text-sm font-medium rounded-full transition-all",
                                mode === 'login'
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            로그인
                        </button>
                        <button
                            type="button"
                            onClick={() => switchMode('register')}
                            className={cn(
                                "flex-1 py-2 text-sm font-medium rounded-full transition-all",
                                mode === 'register'
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            회원가입
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-left">
                            {error}
                        </div>
                    )}

                    {mode === 'login' ? (
                        <>
                            {/* Credentials Login Form */}
                            <form onSubmit={handleCredentialsLogin} className="space-y-3 mb-4">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="이메일"
                                    required
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="비밀번호"
                                    required
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm relative"
                                    disabled={!!isLoading}
                                >
                                    로그인
                                    {isLoading === 'credentials' && (
                                        <div className="absolute inset-0 bg-blue-600/80 flex items-center justify-center rounded-full">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </Button>
                            </form>

                            {/* Divider */}
                            <div className="flex items-center gap-3 my-5">
                                <div className="flex-1 h-px bg-slate-200"></div>
                                <span className="text-xs text-slate-400">또는</span>
                                <div className="flex-1 h-px bg-slate-200"></div>
                            </div>

                            {/* Social Login Buttons */}
                            <div className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full h-14 rounded-full border-slate-200 hover:bg-slate-50 justify-center px-6 gap-3 text-slate-700 font-medium relative overflow-hidden group transition-all"
                                    onClick={() => handleSocialLogin('google')}
                                    disabled={!!isLoading}
                                >
                                    <div className="w-5 h-5 shrink-0 relative flex items-center justify-center">
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

                                <Button
                                    className="w-full h-14 rounded-full bg-[#03C75A] hover:bg-[#02b351] text-white justify-center px-6 gap-3 font-bold relative overflow-hidden group transition-all"
                                    onClick={() => handleSocialLogin('naver')}
                                    disabled={!!isLoading}
                                >
                                    <div className="w-5 h-5 shrink-0 relative flex items-center justify-center">
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
                        </>
                    ) : (
                        <>
                            {/* Register Form */}
                            <form onSubmit={handleRegister} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="이름"
                                    required
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="이메일"
                                    required
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="비밀번호 (8자 이상)"
                                    required
                                    minLength={8}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                                <input
                                    type="password"
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                    placeholder="비밀번호 확인"
                                    required
                                    minLength={8}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />

                                {/* Divider */}
                                <div className="flex items-center gap-3 pt-2 pb-1">
                                    <div className="flex-1 h-px bg-slate-200"></div>
                                    <span className="text-xs text-slate-400">추가 정보 (선택)</span>
                                    <div className="flex-1 h-px bg-slate-200"></div>
                                </div>

                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="전화번호 (010-0000-0000)"
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={zipCode}
                                        readOnly
                                        placeholder="우편번호"
                                        className="flex-1 h-12 px-4 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={handlePostcodeSearch}
                                        className="h-12 px-4 rounded-xl bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium whitespace-nowrap transition-colors"
                                    >
                                        우편번호 검색
                                    </button>
                                </div>

                                {zipCode && (
                                    <>
                                        <input
                                            type="text"
                                            value={address}
                                            readOnly
                                            placeholder="주소"
                                            className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none"
                                        />
                                        <input
                                            type="text"
                                            value={addressDetail}
                                            onChange={(e) => setAddressDetail(e.target.value)}
                                            placeholder="상세 주소 입력"
                                            className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm relative"
                                    disabled={!!isLoading}
                                >
                                    회원가입
                                    {isLoading === 'register' && (
                                        <div className="absolute inset-0 bg-blue-600/80 flex items-center justify-center rounded-full">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </Button>
                            </form>
                        </>
                    )}

                    <p className="mt-8 text-[11px] text-slate-400">
                        {mode === 'login' ? '로그인' : '회원가입'} 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
