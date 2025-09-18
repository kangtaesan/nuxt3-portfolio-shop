<template>
    <div class="cart-wrap">
        <h2 class="title">장바구니</h2>

        <div v-if="!items.length" class="empty">장바구니가 비어있습니다.</div>

        <ul v-else class="list">
            <li v-for="it in items" :key="lineKey(it)" class="row">
                <img v-if="it.imageUrl" :src="it.imageUrl" alt="" class="thumb" />

                <div class="info">
                    <div class="name">{{ it.name }}</div>
                    <div v-if="it.optionName" class="option">옵션: {{ it.optionName }}</div>
                    <div class="bottom">
                        <div class="price">가격: <b>{{ format(unitPrice(it)) }}</b></div>
                        <div class="qty">
                            <button type="button" @click="dec(it)">−</button>
                            <input type="number" :value="it.quantity" disabled class="qty-input is-disabled" />
                            <button type="button" @click="inc(it)">＋</button>
                        </div>
                    </div>
                    <button type="button" class="remove" @click="remove(it)">삭제</button>
                </div>
            </li>
        </ul>
        <div v-if="items.length" class="summary">
            <div>상품 합계 (Subtotal): <b>{{ format(subtotal) }}</b></div>

            <div class="actions">
                <button class="checkout" @click="goCheckout">주문하기</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'
import type { CartItem } from '@/types/order'

const cart = useCartStore()
const auth = useAuthStore()
const items = computed(() => cart.items)

// 동일 라인 식별 키 (productId + optionName)
const lineKey = (it: CartItem) => `${it.productId}::${it.optionName ?? ''}`

// 단가 = 기본가 + 옵션추가금
const unitPrice = (it: CartItem) => it.price + (it.optionExtraPrice ?? 0)

// 합계(소계) 
const subtotal = computed(() =>
    items.value.reduce((sum, it) => sum + unitPrice(it) * it.quantity, 0)
)

function inc(it: CartItem) {
    cart.changeQty(it, it.quantity + 1)
}
function dec(it: CartItem) {
    cart.changeQty(it, it.quantity - 1)
}
function remove(it: CartItem) {
    cart.remove(it)
}

// 금액 표시
const format = (n: number) => n.toLocaleString('ko-KR') + '원'

async function goCheckout() {
    if (!items.value.length) return
    await navigateTo('/paycheck')
}

onMounted(async () => {
    await cart.fetchCart()
})
</script>

<style scoped>
.cart-wrap {
    max-width: 840px;
    margin: 24px auto;
    padding: 0 12px;
}

.title {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 16px;
}

.empty {
    color: #666;
    padding: 40px 0;
    text-align: center;
}

.list {
    display: grid;
    gap: 12px;
}

.row {
    position: relative;
    display: grid;
    grid-template-columns: 100px 1fr;
    gap: 12px;
    padding: 12px;
    border: 1px solid #eee;
    border-radius: 10px;
}

.thumb {
    width: 96px;
    height: 96px;
    object-fit: cover;
    border-radius: 8px;
    background: #f7f7f7;
}

.info {

    display: flex;
    flex-direction: column;
    gap: 6px;
}

.name {
    font-weight: 600;
}

.option {
    font-size: 13px;
    color: #666;
}

.bottom {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.price,
.line-total {
    font-size: 14px;
}

.qty {
    display: flex;
    align-items: center;
    gap: 6px;
}

.qty button {
    width: 28px;
    height: 28px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: #fff;
}

.qty-input.is-disabled {
    width: 56px;
    text-align: center;
    padding: 4px;
    border: 1px solid #ddd;
    border-radius: 6px;

    /* disabled 기본 회색 스타일 무력화 */
    opacity: 1;
    background: #fff;
    color: #111;
    cursor: default;
    -webkit-text-fill-color: #111;
    /* Safari 회색 방지 */
}

.qty-input.is-disabled:focus {
    outline: none;
    box-shadow: none;
}

.qty-input.is-disabled::-webkit-outer-spin-button,
.qty-input.is-disabled::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.remove {
    position: absolute;
    top: 10%;
    left: 94%;
    color: #d00;
    background: transparent;
    border: none;
    cursor: pointer;
}

.summary {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid #eee;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.actions {
    display: flex;
    gap: 8px;
}

.link {
    padding: 10px 14px;
    border: 1px solid #ddd;
    border-radius: 8px;
}

.checkout {
    padding: 10px 16px;
    background: #000;
    color: #fff;
    border-radius: 8px;
}
</style>