<template>
    <div class="products-container">
        <ProductList :products="products"></ProductList>
    </div>
</template>

<script setup lang="ts">
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
.products-container {
    padding: 80px 40px 40px;
}
</style>