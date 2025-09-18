import { useApi } from '@/composables/useApi'
import type { CartItem } from '~/types/order'

type CartRes = { items: CartItem[] }

export function useCartApi() {
  const { get, put } = useApi()

  async function fetchCart() {
    try {
      const res = await get<{ items: CartItem[] }>('/api/cart', {})
      return res.items ?? []
    } catch {
      // 미로그인(401)일 때는 빈 배열 반환
      return []
    }
  }

  async function saveCart(items: CartItem[]): Promise<void> {
    // 실패해도 화면 흐름 막지 않음(다음 변경 때 재시도)
    try { await put<unknown>('/api/cart', { items }) } catch {}
  }

  return { fetchCart, saveCart }
}