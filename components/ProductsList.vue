<template>
    <div>
        <ul v-if="products" class="product-grid" :class="isAdmin ? 'admin' : 'public'">
            <li v-for="product in watchProducts" :key="product._id" class="product-card" @click="goDetail(product._id)">
                <div class="thumb">
                    <img :src="product.image" :alt="product.name">
                </div>
                <p class="name">상품명: {{ product.name }}</p>
                <span class="price">가격: {{ product.price.toLocaleString() }}원</span>
                <p v-if="isAdmin" class="edit" @click.stop="isEdit(product)">수정</p>
                <p v-if="isAdmin" class="delete" @click.stop="isDelete(product._id)">삭제</p>
            </li>

        </ul>
        <div v-else>로딩 중</div>
    </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

interface Product {
    _id: string
    name: string
    price: number
    image: string
}

const props = defineProps<{ products: Product[] }>()
const products = computed(() => props.products)

const route = useRoute()
const router = useRouter()
const isAdmin = computed(() => route.path.startsWith('/admin'))

const goDetail = (id: string) => {
    if (!id) return
    router.push(`/details/${id}`)
}

const isEdit = async (product: Product) => {
    await router.push({ path: '/admin/create-products', query: { id: product._id } })
}

const watchProducts = ref<Product[]>([])

watch(() => props.products, (nextProducts) => {
    watchProducts.value = Array.isArray(nextProducts) ? [...nextProducts] : [];
},
    { immediate: true }
);
const isDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
        await $fetch(`/api/products/${id}`, { method: 'DELETE' })
        alert('삭제되었습니다!')
        watchProducts.value = watchProducts.value.filter((product) => product._id !== id)
    } catch (e: any) {
        alert(e?.message ?? '삭제 실패')
    }
}

</script>

<style scoped>
/* ===================== 공통 ===================== */
.product-grid {
    list-style: none;
    padding: 0;
    margin: 0;
}

.product-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
    box-sizing: border-box;
    cursor: pointer;
}

/* ===================== 사용자(공개) ===================== */
.product-grid.public {
    display: grid;
    grid-template-columns: repeat(4, minmax(280px, 1fr));
    gap: 24px 48px;
}

.product-grid.public .product-card {
    padding: 16px;
}

.product-grid.public .thumb {
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    border-radius: 8px;
    margin-bottom: 12px;
}

.product-grid.public .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.product-grid.public .name {
    font-size: 16px;
    font-weight: 700;
}

.product-grid.public .price {
    font-size: 15px;
    color: #222;
}

/* 반응형 */
@media (max-width: 1400px) {
    .product-grid.public {
        grid-template-columns: repeat(3, minmax(260px, 1fr));
    }
}

@media (max-width: 1000px) {
    .product-grid.public {
        grid-template-columns: repeat(2, minmax(240px, 1fr));
    }
}

@media (max-width: 640px) {
    .product-grid.public {
        grid-template-columns: 1fr;
    }
}

/* ===================== 관리자(리스트형) ===================== */
.product-grid.admin {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.product-grid.admin .product-card {
    display: grid;
    grid-template-columns: 80px 1fr 100px 100px 100px;
    align-items: center;
    gap: 16px;
    padding: 10px 16px;
}

.product-grid.admin .thumb {
    width: 64px;
    height: 64px;
    border-radius: 6px;
    overflow: hidden;
}

.product-grid.admin .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.product-grid.admin .name {
    font-size: 14px;
    font-weight: 600;
}

.product-grid.admin .price {
    font-size: 14px;
    color: #555;
}

.product-grid.admin .edit,
.product-grid.admin .delete {
    cursor: pointer;
    font-size: 13px;
    padding: 6px 10px;
    border-radius: 6px;
    text-align: center;
}

.product-grid.admin .edit {
    background: #3b82f6;
    color: #fff;
}

.product-grid.admin .delete {
    background: #ef4444;
    color: #fff;
}
</style>