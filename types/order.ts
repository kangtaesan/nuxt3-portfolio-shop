export interface CartItem {
    productId: string
    name: string
    price: number
    imageUrl?: string
    optionName?: string
    optionExtraPrice?: number // 옵션 추가금 (없으면 0)
    quantity: number
}

export interface OrderInput {
    items: CartItem[]
    note?: string
}

export interface Order {
    _id: string;
    userId: string;
    items: Array<CartItem & { lineTotal: number }>;
    productsTotal: number;
    shippingFee: number;
    orderTotal: number;
    status: 'pending' | 'paid' | 'canceled' | 'failed';
    createdAt: string;
}