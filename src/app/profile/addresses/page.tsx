'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Plus, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddressForm from '@/components/address-form';
import { Address, getAddresses, createAddress, updateAddress, setDefaultAddress, deleteAddress, CreateAddressDto, UpdateAddressDto } from '@/api/addresses';
import { useAlert } from '@/components/providers/global-alert-provider';

export default function AddressesPage() {
    const { confirm } = useAlert();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/api/auth/signin');
        }
    }, [status, router]);

    useEffect(() => {
        loadAddresses();
    }, [session]);

    const loadAddresses = async () => {
        if (!session?.user?.email) return;

        try {
            const userId = (session.user as any).id || session.user.email;
            const data = await getAddresses(userId);
            setAddresses(data);
        } catch (error) {
            console.error('Failed to load addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data: CreateAddressDto | UpdateAddressDto) => {
        await createAddress(data as CreateAddressDto);
        setShowForm(false);
        loadAddresses();
    };

    const handleUpdate = async (data: CreateAddressDto | UpdateAddressDto) => {
        if (!editingAddress) return;
        const userId = (session?.user as any)?.id || session?.user?.email;
        await updateAddress(editingAddress.id, userId, data as UpdateAddressDto);
        setEditingAddress(null);
        loadAddresses();
    };

    const handleSetDefault = async (id: string) => {
        const userId = (session?.user as any)?.id || session?.user?.email;
        await setDefaultAddress(id, userId);
        loadAddresses();
    };

    const handleDelete = async (id: string) => {
        if (!await confirm('이 주소를 삭제하시겠습니까?', { variant: 'destructive', confirmLabel: '삭제', title: '배송지 삭제' })) return;
        const userId = (session?.user as any)?.id || session?.user?.email;
        await deleteAddress(id, userId);
        loadAddresses();
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="max-w-3xl mx-auto p-4 md:p-6">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/profile" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-700" />
                    </Link>
                    <h1 className="text-2xl font-bold flex-1">배송지 관리</h1>
                    {!showForm && !editingAddress && (
                        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            새 주소 추가
                        </Button>
                    )}
                </div>

                {showForm && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
                        <h2 className="text-lg font-bold mb-4">새 배송지 추가</h2>
                        <AddressForm
                            userId={(session?.user as any)?.id || session?.user?.email || ''}
                            onSubmit={handleCreate}
                            onCancel={() => setShowForm(false)}
                        />
                    </div>
                )}

                {editingAddress && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
                        <h2 className="text-lg font-bold mb-4">배송지 수정</h2>
                        <AddressForm
                            userId={(session?.user as any)?.id || session?.user?.email || ''}
                            address={editingAddress}
                            onSubmit={handleUpdate}
                            onCancel={() => setEditingAddress(null)}
                        />
                    </div>
                )}

                <div className="space-y-4">
                    {addresses.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">등록된 배송지가 없습니다.</p>
                            <p className="text-sm text-slate-400 mt-1">새 주소를 추가해보세요.</p>
                        </div>
                    ) : (
                        addresses.map((addr) => (
                            <div
                                key={addr.id}
                                className={`bg-white rounded-2xl shadow-sm border p-6 ${addr.isDefault ? 'border-blue-300 bg-blue-50/30' : 'border-slate-100'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg">{addr.name}</h3>
                                        {addr.isDefault && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                <Star className="w-3 h-3 fill-current" />
                                                기본 배송지
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {!addr.isDefault && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleSetDefault(addr.id)}
                                                className="text-xs"
                                            >
                                                기본으로 설정
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setEditingAddress(addr)}
                                            className="text-xs"
                                        >
                                            수정
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(addr.id)}
                                            className="text-xs text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-1 text-sm text-slate-600">
                                    <p className="font-medium">{addr.recipient} · {addr.phone}</p>
                                    <p>({addr.zipCode}) {addr.address}</p>
                                    {addr.addressDetail && <p className="text-slate-500">{addr.addressDetail}</p>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
