<template>
    <div v-if="product" class="product-detail">
        <div class="product-info">
            <h1 class="name">{{ product.name }}</h1>
            <p class="description">{{ product.description }}</p>
            <p class="price">판매가: {{ product.price }}</p>
            <div v-if="opts.length" class="option-box">
                <div class="option-tabs" role="tablist">
                    <button v-for="(opt, i) in opts" :key="opt._id || i" class="tab"
                        :class="{ active: selectedIdx === i }" :aria-pressed="selectedIdx === i"
                        :disabled="opt.qty <= 0" role="tab" @click="onPick(i)">
                        {{ opt.label }}
                    </button>
                </div>
            </div>
            <div class="cta">
                <button class="buy" @click="buyNow">BUY IT NOW</button>
                <button class="cart" @click="addToCart">CART</button>
            </div>
        </div>
    </div>
    <div v-else>상품 정보를 불러오는 중...</div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'
import type { CartItem } from '~/types/order'
import { useCartStore } from '~/store/cart';

const props = defineProps<{ product: Product | null }>()
const product = computed(() => props.product)

const opts = computed(() => product.value?.optionStocks ?? [])
const hasOptions = computed(() => (opts.value?.length ?? 0) > 0) // 옵션 배열의 개수로 체크
const selectedIdx = ref<number | null>(null)
const selectedOpt = computed(() =>
    selectedIdx.value != null ? opts.value[selectedIdx.value] : null
)

function onPick(i: number) {
    selectedIdx.value = selectedIdx.value === i ? null : i
}
const cart = useCartStore()
async function addToCart() {
    if (!product.value) return
    if (hasOptions.value && !selectedOpt.value) {
        alert('옵션을 선택하세요.')
        return
    }
    const productData = product.value as any
    const selectedOptData = selectedOpt.value as any
    const item: CartItem = {
        productId: String(productData._id),
        name: productData.name,
        price: Number(productData.price),
        imageUrl: productData.image ?? productData.imageUrl ?? productData.imageurl,
        optionName: selectedOptData?.label,
        optionExtraPrice: 0,
        quantity: 1,
    }
    cart.addOrIncrement(item)
    await cart.saveCartNow()
}
async function buyNow() {
    if (hasOptions.value && !selectedOpt.value) {
        alert('옵션을 선택하세요.')
        return
    }
    addToCart()
    await navigateTo('/cart')
}

</script>

<style scoped>
.product-detail {
    width: 100%;
}

.product-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.name {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
    margin: 0 0 2px;
}

.description {
    color: #666;
    font-size: 14px;
    line-height: 1.5;
}

.price {
    font-weight: 700;
    font-size: 16px;
    margin-top: 4px;
}

/* 옵션 탭 그룹 */
.option-box {
    margin: 10px 0 22px;
}

.option-tabs {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

/* 옵션 탭 버튼 */
.tab {
    min-width: 64px;
    padding: 9px 14px;
    border-radius: 9999px;
    border: 1px solid #ddd;
    background: #fff;
    color: #111;
    cursor: pointer;
    transition: background .15s ease, color .15s ease, border-color .15s ease, transform .02s ease;
}

.tab:hover:not(.active):not(:disabled) {
    border-color: #111;
}

.tab.active {
    background: #111;
    border-color: #111;
    color: #fff;
}

.tab:disabled,
.tab[aria-disabled="true"] {
    opacity: .45;
    cursor: not-allowed;
}

/* CTA 버튼 */
.cta {
    display: grid;
    gap: 12px;
    margin-top: 8px;
}

.buy,
.cart {
    width: 100%;
    padding: 14px 16px;
    border-radius: 8px;
    font-weight: 700;
    letter-spacing: .02em;
    border: 0;
    cursor: pointer;
    transition: transform .02s ease, opacity .15s ease;
}

.buy {
    background: #000;
    color: #fff;
}

.cart {
    background: #efc007;
    color: #111;
}

.buy:active,
.cart:active {
    transform: translateY(1px);
}

.buy:disabled,
.cart:disabled {
    opacity: .5;
    cursor: not-allowed;
}

/* 키보드 접근성 포커스 */
.tab:focus-visible,
.buy:focus-visible,
.cart:focus-visible {
    outline: 2px solid #111;
    outline-offset: 2px;
    border-radius: 10px;
}
</style>