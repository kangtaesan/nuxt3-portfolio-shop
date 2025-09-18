import { useApi } from '@/composables/useApi'

interface userInfo {
    ordererName: string
    ordererPhone: string
    shippingAddr: string
    note?: string
}
interface OrderItem {
    productId: string
    name: string
    imageUrl?: string
    optionName?: string
    price: number
    optionExtraPrice?: number
    quantity: number
    lineTotal: number
}
export type OrderStatus = 'pending' | 'paid' | 'shipping' | 'done' | 'canceled' | 'failed' 
export interface Order {
  _id: string
  items: OrderItem[]
  productsTotal: number
  shippingFee: number
  orderTotal: number
  status: OrderStatus
  ordererName: string
  ordererPhone: string
  shippingAddr: string
  note?: string
  createdAt: string
  updatedAt: string
}
export interface ListParams {
    page?: number
    limit?: number
    status?: OrderStatus
    q?: string
    from?: string
    to?: string
}
interface ListResponse {
    items: Order[]
    meta: { page: number; limit: number; total: number; totalPages: number }
}
export interface CreateOrderPayload {
    items: Array<{
      productId: string
      quantity: number
      optionName?: string
      optionExtraPrice?: number
    }>
    ordererName: string
    ordererPhone: string
    shippingAddr: string
    note?: string
}

export const useOrder = () => {
    const { get, post, patch, del } = useApi()

    /* 최근 주문(자동채우기) */
    const fetchLastOrder = () => get<userInfo | null>('api/orders/last')
    /** 목록 조회 (관리자) */
    const listOrders = (params: ListParams = {}) => get<ListResponse>('/api/orders', params)
    /* 단건 조회 (관리자 상세/마이페이지 상세 공용) */
    const getOrderById = (id: string) => get<Order>(`/api/orders/${id}`)
    /* 상태 변경 */
    const updateOrderStatus = (id: string, status: OrderStatus) => patch<Order>(`/api/orders/${id}`, { status })
    /* 주문 생성 */
    const createOrder = (payload: CreateOrderPayload) => post<{ orderId: string; orderTotal: number }>('/api/orders/create', payload)

    const deleteOrder = (id: string) => del(`/api/orders/${id}`)

    return { 
        fetchLastOrder,
        listOrders,
        getOrderById,
        updateOrderStatus,
        createOrder,
        deleteOrder,
    }
}