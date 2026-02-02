export interface Order {
    id: string;
    date: string;
    title: string;
    status: string;
    stepIndex: number;
    images: {
        url: string;
        sketchedUrl?: string; // Add sketchedUrl
        description: string;
    }[];
    description?: string; // Global description
}

let MOCK_ORDERS: Order[] = [
    {
        id: 'REQ-20240201-001',
        date: '2024.02.01',
        title: '나이키 패딩 지퍼 교체',
        status: '견적 산출',
        stepIndex: 1,
        images: [{
            url: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=200&auto=format&fit=crop',
            description: '지퍼가 고장났어요'
        }]
    },
    {
        id: 'REQ-20240115-003',
        date: '2024.01.15',
        title: '청바지 기장 수선',
        status: '수선 완료',
        stepIndex: 5,
        images: [{
            url: 'https://images.unsplash.com/photo-1542272617-08f08630329f?q=80&w=200&auto=format&fit=crop',
            description: '3cm 줄여주세요'
        }]
    },
];

export async function getOrders(): Promise<Order[]> {
    // Simulate network delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_ORDERS);
        }, 500);
    });
}

export async function createOrder(data: { images: { url: string; sketchedUrl?: string; description: string }[]; selectedCategory: string; description: string }): Promise<{ success: boolean; id: string }> {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Order created:', data);
            const newOrder: Order = {
                id: `REQ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`,
                date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.'),
                title: `${data.images.length}개의 수선 요청`, // Simple title generation
                status: '접수 완료',
                stepIndex: 0,
                images: data.images,
                description: data.description
            };
            MOCK_ORDERS = [newOrder, ...MOCK_ORDERS];
            resolve({ success: true, id: newOrder.id });
        }, 1000);
    });
}
