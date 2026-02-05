'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Address, CreateAddressDto, UpdateAddressDto } from '@/api/addresses';

import { useAlert } from '@/components/providers/global-alert-provider';

interface AddressFormProps {
    userId: string;
    address?: Address;
    onSubmit: (data: CreateAddressDto | UpdateAddressDto) => Promise<void>;
    onCancel: () => void;
}

export default function AddressForm({ userId, address, onSubmit, onCancel }: AddressFormProps) {
    const { alert, confirm } = useAlert();
    const [name, setName] = useState(address?.name || '');
    const [recipient, setRecipient] = useState(address?.recipient || '');
    const [phone, setPhone] = useState(address?.phone || '');
    const [zipCode, setZipCode] = useState(address?.zipCode || '');
    const [addressLine, setAddressLine] = useState(address?.address || '');
    const [addressDetail, setAddressDetail] = useState(address?.addressDetail || '');
    const [isDefault, setIsDefault] = useState(address?.isDefault || false);
    const [loading, setLoading] = useState(false);

    const handlePostcodeSearch = () => {
        // Check if Daum Postcode API is loaded
        if (typeof window === 'undefined' || !(window as any).daum || !(window as any).daum.Postcode) {
            alert('우편번호 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        new (window as any).daum.Postcode({
            oncomplete: function (data: any) {
                setZipCode(data.zonecode);
                setAddressLine(data.address);
            },
        }).open();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Show confirmation dialog with address details
        const confirmMessage = `입력하신 주소가 맞는지 확인해주세요:\n\n` +
            `주소지 이름: ${name}\n` +
            `수령인: ${recipient}\n` +
            `연락처: ${phone}\n` +
            `우편번호: ${zipCode}\n` +
            `주소: ${addressLine}\n` +
            `상세 주소: ${addressDetail || '(없음)'}\n` +
            `기본 배송지: ${isDefault ? '예' : '아니오'}\n\n` +
            `이 주소로 저장하시겠습니까?`;

        const confirmed = await confirm(confirmMessage, { title: '주소 확인' });
        if (!confirmed) return;

        setLoading(true);

        try {
            const data = address
                ? { name, recipient, phone, zipCode, address: addressLine, addressDetail, isDefault }
                : { userId, name, recipient, phone, zipCode, address: addressLine, addressDetail, isDefault };

            await onSubmit(data);
        } catch (error) {
            console.error('Failed to save address:', error);
            await alert(`주소 저장에 실패했습니다.\n\n오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`, { title: '저장 실패' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">주소지 이름</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 집, 회사"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">수령인</label>
                <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="이름"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">연락처</label>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">우편번호</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={zipCode}
                        readOnly
                        placeholder="우편번호"
                        required
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
                    />
                    <Button type="button" onClick={handlePostcodeSearch} className="bg-slate-600 hover:bg-slate-700">
                        우편번호 검색
                    </Button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">주소</label>
                <input
                    type="text"
                    value={addressLine}
                    readOnly
                    placeholder="주소"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">상세 주소</label>
                <input
                    type="text"
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                    placeholder="상세 주소 입력"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isDefault" className="text-sm font-medium text-slate-700">
                    기본 배송지로 설정
                </label>
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {loading ? '저장 중...' : address ? '수정' : '추가'}
                </Button>
                <Button type="button" onClick={onCancel} variant="outline" className="flex-1">
                    취소
                </Button>
            </div>
        </form>
    );
}
