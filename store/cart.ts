import { defineStore } from 'pinia'
import type { CartItem } from '~/types/order'
import { useCartApi } from '@/composables/useCart'

let saveTimer: ReturnType<typeof setTimeout> | null = null

export const useCartStore = defineStore('cart', {
    state: () => ({
        items: [] as CartItem[],
        initialized: false,
      }),
    actions: {
        // --- 서버에서 읽어오고 스토어 채우기 ---
        async fetchCart(force = false) {
            if (this.initialized && !force) return
            try {
              const { fetchCart } = useCartApi()
              const list = await fetchCart() 
              this.items = Array.isArray(list) ? list : []
            } finally {
              this.initialized = true
            }
          },
        // --- 현재 items를 서버에 저장(디바운스) ---
        saveCartDebounced(wait = 500) {
            if (saveTimer) clearTimeout(saveTimer)
                saveTimer = setTimeout(async () => {
                const { saveCart } = useCartApi()
                await saveCart(this.items)
            }, wait)
        },
        // 체크아웃 등 즉시 저장이 필요한 곳에서 사용
        async saveCartNow() {
            const { saveCart } = useCartApi()
            await saveCart(this.items)
        },
        addOrIncrement(newItem: CartItem) {
          const line = this.items.find(
            x => x.productId === newItem.productId
              && (x.optionName ?? '') === (newItem.optionName ?? '')
          )
          if (line) {
            line.quantity += newItem.quantity
          } else {
            this.items.push({ ...newItem })
          }
          this.saveCartDebounced()
        },
        
        remove(target: CartItem) {
          this.items = this.items.filter(
            x => !(x.productId === target.productId
              && (x.optionName ?? '') === (target.optionName ?? ''))
          )
          this.saveCartDebounced()
        },
        
        changeQty(target: CartItem, newQty: number) {
          const line = this.items.find(
            x => x.productId === target.productId
              && (x.optionName ?? '') === (target.optionName ?? '')
          )
          if (line) {
            line.quantity = Math.max(1, newQty)
            this.saveCartDebounced()
          }
        },
        clear() {
            this.items = []
            this.saveCartDebounced()
        },
    }
})