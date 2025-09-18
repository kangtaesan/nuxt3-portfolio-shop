<template>
    <div class="checkout-wrap">
        <h1>주문 / 결제</h1>

        <div v-if="!items.length" class="empty">장바구니가 비어있습니다.</div>

        <div v-else>
            <!-- 주문자 정보 -->
            <section class="card">
                <div class="form-head">
                    <h3>주문자 정보</h3>
                    <button type="button" class="ghost" @click="fillFromLast" :disabled="loading">
                        최근 사용 정보 불러오기
                    </button>
                </div>
                <div class="form">
                    <label>이름<input v-model="name" required placeholder="이름을 작성해주세요." /></label>
                    <label>전화번호<input v-model="phone" required placeholder="(-) 빼고 작성해주세요." /></label>
                    <label>주소<input v-model="address" required placeholder="정확한 주소를 입력해주세요." /></label>
                    <label>요청사항<textarea v-model="note" rows="3" /></label>
                </div>
            </section>

            <!-- 상품 목록 -->
            <section class="card">
                <h3>상품 목록</h3>
                <ul class="lines">
                    <li v-for="it in items" :key="lineKey(it)" class="line">
                        <div class="thumb">
                            <img :src="it.imageUrl || '/no-image.png'" alt="" />
                        </div>
                        <div class="meta">
                            <div class="name">{{ it.name }}</div>
                            <div v-if="it.optionName" class="opt">옵션: {{ it.optionName }}</div>
                        </div>
                        <div class="qty">× {{ it.quantity }}</div>
                        <div class="price">{{ format(unitPrice(it) * it.quantity) }}</div>
                    </li>
                </ul>
            </section>

            <!-- 합계 -->
            <section class="card summary">
                <div class="row">
                    <span>상품합계</span>
                    <b>{{ format(subtotal) }}</b>
                </div>
                <div class="row">
                    <span>배송비</span>
                    <b>{{ format(shippingFee) }}</b>
                </div>
                <div class="row total">
                    <span>결제금액</span>
                    <b>{{ format(orderTotal) }}</b>
                </div>

                <div class="actions">
                    <NuxtLink class="btn ghost" to="/cart">장바구니로</NuxtLink>
                    <button class="btn primary" :disabled="submitting" @click="placeOrder">
                        {{ submitting ? '처리 중…' : '결제하기' }}
                    </button>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/store/cart'
import type { CartItem } from '@/types/order'
import { useApi } from '@/composables/useApi'
import { useOrder } from '@/composables/useOrder'


const cart = useCartStore()
const { post } = useApi()
const { fetchLastOrder } = useOrder()



const items = computed(() => cart.items)
const lineKey = (it: CartItem) => `${it.productId}::${it.optionName ?? ''}`
const unitPrice = (it: CartItem) => it.price + (it.optionExtraPrice ?? 0)
const subtotal = computed(() =>
    items.value.reduce((s, it) => s + unitPrice(it) * it.quantity, 0)
)
const shippingFee = 0 // 조건부 배송비 설정
const orderTotal = computed(() => subtotal.value + shippingFee)
const format = (n: number) => n.toLocaleString('ko-KR') + '원'

const name = ref('')
const phone = ref('')
const address = ref('')
const note = ref('')
const loading = ref(false)
const submitting = ref(false)

async function fillFromLast() {
    try {
        loading.value = true
        const last = await fetchLastOrder()
        if (!last) {
            alert('최근 주문 내역이 없습니다.')
            return
        }
        name.value = last.ordererName || ''
        phone.value = last.ordererPhone || ''
        address.value = last.shippingAddr || ''
        note.value = last.note || ''
    } catch (e: any) {
        // 401 등은 로그인 필요
        alert(e?.message || '최근 정보를 불러오지 못했습니다.')
    } finally {
        loading.value = false
    }
}
// 카트 비었으면 guard
onMounted(async () => {
    if (!cart.initialized) await cart.fetchCart()

    if (!name.value && !phone.value && address.value) {
        try {
            const last = await fetchLastOrder()
            if (last) {
                name.value = last.ordererName || ''
                phone.value = last.ordererPhone || ''
                address.value = last.shippingAddr || ''
                note.value = last.note || ''
            }
        } catch {/* 무시 */ }
    }
})

async function placeOrder() {
    if (!items.value.length || submitting.value) return
    // 간단 검증
    if (!name || !phone || !address) {
        return alert('주문자 정보를 입력해주세요.')
    }

    try {
        submitting.value = true

        // 서버가 가격/재고를 최종 검증하므로 우리는 최소 필드만 보냄
        const payload = {
            items: items.value.map(it => ({
                productId: it.productId,
                quantity: it.quantity,
                optionName: it.optionName,
                optionExtraPrice: it.optionExtraPrice ?? 0,
            })),
            ordererName: name.value,
            ordererPhone: phone.value,
            shippingAddr: address.value,
            note: note.value,
        }

        // 서버: /api/orders/create  (이전 단계에서 구현해둔 엔드포인트)
        const res = await post<{ orderId: string; orderTotal: number }>(
            '/api/orders/create', payload)

        // 카트 비우고 서버에도 반영
        cart.items = []
        await cart.saveCartNow()

        // 완료 페이지로 이동(간단)
        await navigateTo(`/orders/${res.orderId}`)
    } catch (e: any) {
        alert(e?.message || '주문 처리 중 오류가 발생했습니다.')
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped>
.checkout-wrap {
    max-width: 800px;
    margin: 32px auto;
    padding: 0 12px;
}

h1 {
    margin-bottom: 16px;
}

.card {
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    background: #fff;
}

.form-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px
}

button.ghost {
    padding: 6px 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: #fff
}

button.ghost:disabled {
    opacity: .6;
    cursor: not-allowed
}

.empty {
    padding: 48px 0;
    color: #777;
    text-align: center;
}

.form label {
    display: grid;
    gap: 6px;
    margin-bottom: 10px;
}

.form input,
.form textarea {
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 10px 12px;
}

.lines {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 12px;
}

.line {
    display: grid;
    grid-template-columns: 64px 1fr auto auto;
    align-items: center;
    gap: 12px;
}

.thumb {
    width: 64px;
    height: 64px;
    border-radius: 10px;
    overflow: hidden;
    background: #f6f6f6;
}

.thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.meta .name {
    font-weight: 700;
}

.meta .opt {
    color: #777;
    font-size: 13px;
    margin-top: 2px;
}

.qty {
    color: #444;
    min-width: 48px;
    text-align: right;
}

.price {
    min-width: 100px;
    text-align: right;
    font-weight: 600;
}

.summary .row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
}

.summary .row+.row {
    border-top: 1px dashed #eee;
}

.summary .row.total {
    font-size: 18px;
}

.summary .row.total b {
    color: #111;
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 12px;
}

.btn {
    padding: 10px 16px;
    border-radius: 10px;
    border: 0;
    cursor: pointer;
}

.btn.ghost {
    background: #f4f4f4;
}

.btn.primary {
    background: #000;
    color: #fff;
}
</style>