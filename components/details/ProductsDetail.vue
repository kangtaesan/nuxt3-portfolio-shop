<template>
    <div v-if="product" class="detail-images">
        <div class="product-images">
            <img :src="product.image" :alt="product.name" />
        </div>
        <img v-for="(url, idx) in detailImgs" :key="url + idx" :src="url" :alt="`${product.name}-detail-${idx + 1}`"
            loading="lazy" class="detail-img" />
        <p v-if="detailImgs.length === 0" class="empty">상세 이미지가 없습니다.</p>
    </div>
    <div v-else>로딩 중...</div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'

const props = defineProps<{ product: Product | null }>()
const product = computed(() => props.product)
const detailImgs = computed(() => props.product?.detailImages ?? [])
</script>

<style scoped>
.product-images {
    position: relative;
    width: 100%;
    padding-top: 100%;
    overflow: hidden;
    background: #f9f9f9;
}

.product-images img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.detail-images {
    width: 100%;
    margin: 32px auto 0;
    display: flex;
    flex-direction: column;
}

.detail-img {
    width: 100%;
    height: auto;
    display: block;
}

.empty {
    color: #888;
    font-size: 14px;
    text-align: center;
    padding: 24px 0;
}
</style>