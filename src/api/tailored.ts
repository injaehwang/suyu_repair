// Tailored (맞춤정장) API client

export interface TailoredOrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  jacketType: string;
  fabricId?: string;
  fabric?: FabricResponse;
  designOptions?: any;
  estimatedPrice?: number;
  finalPrice?: number;
  estimatedCompletionDate?: string;
  specialRequests?: string;
  measurement?: MeasurementResponse;
  fittings?: FittingResponse[];
  images?: TailoredImageResponse[];
  user?: { id: string; name: string; email: string };
  carrier?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FabricResponse {
  id: string;
  name: string;
  code: string;
  brand?: string;
  material: string;
  weight?: number;
  season: string;
  color: string;
  pattern: string;
  imageUrl?: string;
  pricePerMeter: number;
  isAvailable: boolean;
  description?: string;
}

export interface MeasurementResponse {
  id: string;
  chest: number;
  shoulder: number;
  sleeveLength: number;
  jacketLength: number;
  waist: number;
  hip: number;
  neck: number;
  bicep: number;
  wrist: number;
  backWidth: number;
  height?: number;
  weight?: number;
  bodyType?: string;
  posture?: string;
  notes?: string;
  measuredAt: string;
  measuredBy?: string;
}

export interface FittingResponse {
  id: string;
  fittingNumber: number;
  scheduledDate: string;
  status: string;
  location?: string;
  notes?: string;
  adjustments?: any;
}

export interface TailoredImageResponse {
  id: string;
  type: string;
  imageUrl: string;
  description?: string;
}

export interface CreateTailoredOrderRequest {
  userId: string;
  jacketType: string;
  specialRequests?: string;
  images?: { type: string; imageUrl: string; description?: string }[];
}

// 맞춤 주문 생성
export const createTailoredOrder = async (data: CreateTailoredOrderRequest) => {
  const response = await fetch('/api/tailored/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || '맞춤 주문 생성에 실패했습니다.');
  }
  return response.json();
};

// 고객 맞춤 주문 목록
export const getTailoredOrdersByUser = async (email: string): Promise<TailoredOrderResponse[]> => {
  const response = await fetch(`/api/tailored/orders/user?email=${encodeURIComponent(email)}`);
  if (!response.ok) {
    throw new Error('맞춤 주문 목록을 불러오는데 실패했습니다.');
  }
  return response.json();
};

// 맞춤 주문 상세
export const getTailoredOrder = async (id: string): Promise<TailoredOrderResponse> => {
  const response = await fetch(`/api/tailored/orders/${id}`);
  if (!response.ok) {
    throw new Error('맞춤 주문을 불러오는데 실패했습니다.');
  }
  return response.json();
};

// 맞춤 주문 수정
export interface UpdateTailoredOrderRequest {
  jacketType?: string;
  fabricId?: string;
  designOptions?: any;
  specialRequests?: string;
}

export const updateTailoredOrder = async (
  id: string,
  data: UpdateTailoredOrderRequest,
): Promise<TailoredOrderResponse> => {
  const response = await fetch(`/api/tailored/orders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || '주문 수정에 실패했습니다.');
  }
  return response.json();
};

// 신체 치수 생성
export interface CreateMeasurementRequest {
  orderId: string;
  userId: string;
  chest: number;
  shoulder: number;
  sleeveLength: number;
  jacketLength: number;
  waist: number;
  hip: number;
  neck: number;
  bicep: number;
  wrist: number;
  backWidth: number;
  height?: number;
  weight?: number;
  bodyType?: string;
  posture?: string;
  notes?: string;
}

export const createTailoredMeasurement = async (
  data: CreateMeasurementRequest,
): Promise<MeasurementResponse> => {
  const response = await fetch('/api/tailored/measurements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || '치수 저장에 실패했습니다.');
  }
  return response.json();
};

// 이미지 업로드 (참고 이미지)
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('/api/upload', { method: 'POST', body: formData });
  if (!response.ok) throw new Error('이미지 업로드에 실패했습니다.');
  const data = await response.json();
  return data.url;
};

// 원단 목록
export const getFabrics = async (filters?: Record<string, string>): Promise<FabricResponse[]> => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }
  const response = await fetch(`/api/tailored/fabrics?${params.toString()}`);
  if (!response.ok) {
    throw new Error('원단 목록을 불러오는데 실패했습니다.');
  }
  return response.json();
};
