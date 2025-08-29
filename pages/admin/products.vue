<template>
    <div>
        <NuxtLink to="/admin/create-products">
            <button>상품 등록</button>
        </NuxtLink>
        <div class="product-list">
            <p>상품 목록</p>
            <ProductList :products="products"></ProductList>
        </div>

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
    padding: 24px 40px;
}
</style>