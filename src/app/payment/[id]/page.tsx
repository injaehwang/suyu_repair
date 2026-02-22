'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadPaymentWidget, PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';
import { useSession } from 'next-auth/react';
import { Address, getAddresses } from '@/api/addresses';
import AddressForm from '@/components/address-form';
import { MapPin, Plus } from 'lucide-react';
import { useAlert } from '@/components/providers/global-alert-provider';

import { Button } from '@/components/ui/button';

// Use environment variable or fallback to test key (ONLY FOR DEV)
const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_gck_KNbdOvk5rkDgYgP2bWXv8n07xlzm';

export default function PaymentPage() {
    const { alert } = useAlert();
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [paymentWidget, setPaymentWidget] = useState<PaymentWidgetInstance | null>(null);
    const [order, setOrder] = useState<any>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState<any>(null);
    const [pickupDate, setPickupDate] = useState<string>('');
    const paymentMethodsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (params?.id) {
            fetch(`/api/orders/${params.id}`)
                .then(res => res.json())
                .then(data => {
                    setOrder(data);
                })
                .catch(err => console.error(err));
        }
    }, [params?.id]);

    useEffect(() => {
        const loadUserAddresses = async () => {
            if (!session?.user?.email) return;
            try {
                const userId = (session.user as any)?.id || session.user.email;
                const data = await getAddresses(userId);
                setAddresses(data);
                // Auto-select default address
                const defaultAddr = data.find(addr => addr.isDefault);
                if (defaultAddr) setSelectedAddress(defaultAddr);
            } catch (error) {
                console.error('Failed to load addresses:', error);
            }
        };
        loadUserAddresses();
    }, [session]);

    useEffect(() => {
        const price = order?.finalPrice || order?.estimatedPrice;
        if (!order || !price) return;

        // Use User ID or Random String for anonymous
        const customerKey = (session?.user as any)?.id || `ANONYMOUS-${new Date().getTime()}`;

        loadPaymentWidget(clientKey, customerKey).then((widget) => {
            setPaymentWidget(widget);

            // Render Payment Methods
            widget.renderPaymentMethods(
                '#payment-method',
                { value: price },
                { variantKey: 'DEFAULT' } // optional
            );

            // Render Agreement
            widget.renderAgreement('#agreement', { variantKey: 'AGREEMENT' });
        });
    }, [order, session]);

    const handlePayment = async () => {
        if (!paymentWidget || !order) return;

        const shippingInfo = selectedAddress || newAddress;
        if (!shippingInfo) {
            await alert('주소를 선택하거나 입력해주세요.', { title: '입력 확인' });
            return;
        }

        if (!pickupDate) {
            await alert('수거 희망 날짜를 선택해주세요.', { title: '입력 확인' });
            return;
        }

        // Validate pickup date (Tomorrow ~ 8 days)
        const selectedDate = new Date(pickupDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 8);

        if (selectedDate < tomorrow) {
            await alert('수거 날짜는 내일 이후로 선택해주세요.', { title: '날짜 확인' });
            return;
        }

        if (selectedDate > maxDate) {
            await alert('수거 날짜는 최대 8일 이내로 선택해주세요.', { title: '날짜 확인' });
            return;
        }

        try {
            // ... (rest of logic)
            // Save shipping info to order
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${order.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shippingName: shippingInfo.recipient,
                    shippingPhone: shippingInfo.phone,
                    shippingZipCode: shippingInfo.zipCode,
                    shippingAddress: shippingInfo.address,
                    shippingAddressDetail: shippingInfo.addressDetail,
                    pickupDate: new Date(pickupDate).toISOString(),
                }),
            });

            await paymentWidget.requestPayment({
                orderId: order.id,
                orderName: order.title || '수선 서비스',
                customerName: session?.user?.name || '익명 고객',
                customerEmail: session?.user?.email || undefined,
                successUrl: `${window.location.origin}/payment/success`,
                failUrl: `${window.location.origin}/payment/fail`,
            });
        } catch (error) {
            console.error('Payment Error', error);
            await alert('결제 요청 중 오류가 발생했습니다.'); // Added failure alert just in case
        }
    };

    if (!order) return <div className="p-10 text-center">주문 정보를 불러오는 중...</div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6">
                <h1 className="text-2xl font-bold mb-6 text-center">결제하기</h1>

                <div className="mb-6 border-b border-slate-100 pb-4">
                    <p className="text-slate-500 text-sm mb-1">주문명</p>
                    <p className="font-medium text-lg">{order.title}</p>
                </div>

                <div className="mb-6 border-b border-slate-100 pb-4">
                    <p className="text-slate-500 text-sm mb-1">결제 금액</p>
                    <p className="font-bold text-2xl text-blue-600">{(order.finalPrice || order.estimatedPrice)?.toLocaleString()}원</p>
                </div>

                {/* Address Selection */}
                <div className="mb-6 border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-slate-700 font-bold flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            주소
                        </p>
                        {!showNewAddressForm && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowNewAddressForm(true)}
                                className="text-xs"
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                새 주소
                            </Button>
                        )}
                    </div>

                    {showNewAddressForm ? (
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <AddressForm
                                userId={(session?.user as any)?.id || session?.user?.email || ''}
                                onSubmit={async (data) => {
                                    setNewAddress(data);
                                    setSelectedAddress(null);
                                    setShowNewAddressForm(false);
                                }}
                                onCancel={() => setShowNewAddressForm(false)}
                            />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {addresses.map((addr) => (
                                <label
                                    key={addr.id}
                                    className={`block p-3 border rounded-lg cursor-pointer transition-colors ${selectedAddress?.id === addr.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="address"
                                        checked={selectedAddress?.id === addr.id}
                                        onChange={() => {
                                            setSelectedAddress(addr);
                                            setNewAddress(null);
                                        }}
                                        className="sr-only"
                                    />
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{addr.name}</p>
                                            <p className="text-xs text-slate-600 mt-1">
                                                {addr.recipient} · {addr.phone}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                ({addr.zipCode}) {addr.address} {addr.addressDetail}
                                            </p>
                                        </div>
                                        {addr.isDefault && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                기본
                                            </span>
                                        )}
                                    </div>
                                </label>
                            ))}
                            {newAddress && (
                                <div className="p-3 border border-blue-500 bg-blue-50 rounded-lg">
                                    <p className="font-medium text-sm">{newAddress.name}</p>
                                    <p className="text-xs text-slate-600 mt-1">
                                        {newAddress.recipient} · {newAddress.phone}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        ({newAddress.zipCode}) {newAddress.address} {newAddress.addressDetail}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Pickup Date Selection */}
                <div className="mb-6 border-b border-slate-100 pb-4">
                    <label htmlFor="pickupDate" className="block text-slate-700 font-bold mb-2">
                        수거 희망 날짜 *
                    </label>
                    <p className="text-xs text-slate-500 mb-3">
                        내일부터 최대 8일 이내로 선택 가능합니다.
                    </p>
                    <input
                        type="date"
                        id="pickupDate"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        max={new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    />
                </div>

                {/* Toss Payments UI Containers */}
                <div id="payment-method" className="my-4" />
                <div id="agreement" className="my-4" />

                <button
                    onClick={handlePayment}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-blue-200 shadow-lg mt-4"
                >
                    결제하기
                </button>

                <button
                    onClick={() => router.back()}
                    className="w-full mt-3 text-slate-500 text-sm hover:underline"
                >
                    취소하고 돌아가기
                </button>
            </div>
        </div>
    );
}
