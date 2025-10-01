<template>
    <div class="product-list">
        <div class="top">
            <p>상품 목록</p>
            <NuxtLink to="/admin/create-products">
                <button>상품 등록</button>
            </NuxtLink>
        </div>
        <ProductList :products="products"></ProductList>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })
import ProductList from '@/components/ProductsList.vue'
import { fetchProductList } from '~/composables/useProducts';

interface Product {
    _id: string
    name: string
    price: number
    image: string
}

const products = ref<Product[]>([])
const fetched = await fetchProductList()
products.value = fetched.value // fetched는 Ref<Product[]>
</script>

<style scoped>
.product-list {
    margin: 24px 0 80px;
    padding: 0 16px;
}

.product-list .top {
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.product-list .top p {
    font-size: 22px;
    font-weight: 600;
}

.product-list .top button {
    background: #111827;
    color: #fff;
    border-color: #111827;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
}

.product-list .top button:hover {
    opacity: .95;
    box-shadow: 0 10px 22px rgba(0, 0, 0, .03);
}
</style>