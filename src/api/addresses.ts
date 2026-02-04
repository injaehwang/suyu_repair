export interface Address {
    id: string;
    userId: string;
    name: string;
    recipient: string;
    phone: string;
    zipCode: string;
    address: string;
    addressDetail?: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAddressDto {
    userId: string;
    name: string;
    recipient: string;
    phone: string;
    zipCode: string;
    address: string;
    addressDetail?: string;
    isDefault?: boolean;
}

export interface UpdateAddressDto {
    name?: string;
    recipient?: string;
    phone?: string;
    zipCode?: string;
    address?: string;
    addressDetail?: string;
    isDefault?: boolean;
}

const API_URL = 'http://localhost:4000';

export const getAddresses = async (userId: string): Promise<Address[]> => {
    const res = await fetch(`${API_URL}/addresses?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch addresses');
    return res.json();
};

export const createAddress = async (data: CreateAddressDto): Promise<Address> => {
    const res = await fetch(`${API_URL}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorText = await res.text();
        console.error('Create address error:', errorText);
        throw new Error(`Failed to create address: ${errorText}`);
    }
    return res.json();
};

export const updateAddress = async (id: string, userId: string, data: UpdateAddressDto): Promise<any> => {
    const res = await fetch(`${API_URL}/addresses/${id}?userId=${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update address');
    return res.json();
};

export const setDefaultAddress = async (id: string, userId: string): Promise<any> => {
    const res = await fetch(`${API_URL}/addresses/${id}/default?userId=${userId}`, {
        method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to set default address');
    return res.json();
};

export const deleteAddress = async (id: string, userId: string): Promise<any> => {
    const res = await fetch(`${API_URL}/addresses/${id}?userId=${userId}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete address');
    return res.json();
};
