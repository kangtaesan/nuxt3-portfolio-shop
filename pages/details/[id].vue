<template>
    <div v-if="product" class="product-layout">
        <ProductsDetail class="left" :product="product"></ProductsDetail>
        <ProductsMain class="right" :product="product"></ProductsMain>
    </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { fetchProductById } from '~/composables/useProducts';
import ProductsMain from '~/components/details/ProductsMain.vue'
import ProductsDetail from '~/components/details/ProductsDetail.vue';
import type { Product } from '~/types/product'

// 현재 경로의 동적 파라미터를 route.params로 가져와 서버로 넘김
const route = useRoute()
const id = String(route.params.id ?? '')

const { data, error } = await fetchProductById(id)
const product = computed<Product | null>(() => data.value || null)
if (error.value) {
    console.log('상품 조회 에러:', error.value)
}
</script>

<style scoped>
.product-layout {
    width: 90%;
    margin: 40px auto;
    display: grid;
    grid-template-columns: 6fr 4fr;
    /* 왼쪽 가변, 오른쪽 420px 패널 */
    gap: 120px;
    align-items: start;
}

.right {
    position: sticky;
    top: 250px;
    /* 헤더 높이에 맞춰 조정 */
    height: fit-content;
}
</style>