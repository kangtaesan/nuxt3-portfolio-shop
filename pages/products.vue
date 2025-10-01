<!-- pages/products.vue -->
<template>
    <div class="products-container">
        <div class="toolbar">
            <div class="summary">
                <strong v-if="q">"{{ q }}"</strong>
                <span>검색 결과</span>
                <span v-if="meta.total">({{ meta.total }}개)</span>
            </div>

            <select v-model="sort" class="sel">
                <option value="">최신순</option>
                <option value="priceAsc">가격 낮은순</option>
                <option value="priceDesc">가격 높은순</option>
            </select>
        </div>

        <div v-if="pending" class="empty">불러오는 중…</div>
        <div v-else-if="!displayProducts.length" class="empty">상품이 없습니다.</div>

        <ProductList :products="displayProducts" />
    </div>

    <!-- 페이지네이션 -->
    <nav class="pager" v-if="pagesCount > 1">
        <button class="pg-btn" :disabled="page === 1" @click="go(1)">« 처음</button>
        <button class="pg-btn" :disabled="page === 1" @click="go(page - 1)">‹ 이전</button>

        <button class="pg-btn" v-for="n in pages" :key="n" :class="{ active: n === page }" @click="go(n)">
            {{ n }}
        </button>

        <button class="pg-btn" :disabled="page === pagesCount" @click="go(page + 1)">다음 ›</button>
        <button class="pg-btn" :disabled="page === pagesCount" @click="go(pagesCount)">마지막 »</button>
    </nav>
</template>

<script setup lang="ts">
import ProductList from '@/components/ProductsList.vue'
import { fetchProductList } from '@/composables/useProducts'
import { useRoute, useRouter } from 'vue-router'

interface Product {
    _id: string
    name: string
    price: number
    image: string
}

/* 기본 데이터 로드 */
const products = ref<Product[]>([])

const { data: fetched, pending } = await useAsyncData<Product[]>(
    'products',
    async () => {
        // fetchProductList()가 Ref<Product[]>를 돌려주는 경우를 대비
        const list = await fetchProductList()
        // list가 ref라면 .value, 아니라면 그대로 반환
        return Array.isArray(list) ? list : (list as any).value
    },
    { default: () => [], }
)

// 로드된 목록 반영 (fetched는 항상 Product[])
watchEffect(() => {
    products.value = fetched.value
})

/* 검색/정렬/페이지 상태 */
const route = useRoute()
const router = useRouter()

// 헤더에서 넘어온 쿼리(q) 읽기
const q = ref<string>((route.query.q as string) || '')
const sort = ref<string>((route.query.sort as string) || '')
const page = ref<number>(Number(route.query.page || 1))
const limit = 24

// 라우트 쿼리 변화 → 화면 상태 동기화
watch(
    () => route.query,
    (qry) => {
        q.value = (qry.q as string) || ''
        sort.value = (qry.sort as string) || ''
        page.value = Number(qry.page || 1)
    },
    { immediate: true }
)

/* 필터 + 정렬 */
const filtered = computed<Product[]>(() => {
    const keyword = q.value.trim()
    if (!keyword) return products.value

    const rx = new RegExp(keyword, 'i')
    return products.value.filter((p) => rx.test(p.name))
})

const sorted = computed<Product[]>(() => {
    const arr = [...filtered.value]
    if (sort.value === 'priceAsc') {
        arr.sort((a, b) => a.price - b.price)
    } else if (sort.value === 'priceDesc') {
        arr.sort((a, b) => b.price - a.price)
    }
    // sort가 빈 값이면 서버 기본(최신) 정렬 그대로 사용
    return arr
})

/* 메타/페이지네이션 */
const meta = reactive({
    page: 1,
    limit,
    total: 0,
    totalPages: 1,
})

const pagesCount = computed(() =>
    Math.max(1, Math.ceil(sorted.value.length / limit))
)

const pages = computed<number[]>(() => {
    const total = pagesCount.value
    const windowSize = 5
    const current = Math.min(page.value, total)
    let start = Math.max(1, current - Math.floor(windowSize / 2))
    let end = Math.min(total, start + windowSize - 1)
    start = Math.max(1, end - windowSize + 1)
    const arr: number[] = []
    for (let n = start; n <= end; n++) arr.push(n)
    return arr.length ? arr : [1]
})

const displayProducts = computed<Product[]>(() => {
    meta.page = page.value
    meta.total = sorted.value.length
    meta.totalPages = pagesCount.value

    const start = (page.value - 1) * limit
    return sorted.value.slice(start, start + limit)
})

/* 이동 */
function go(n: number) {
    if (n < 1 || n > pagesCount.value || n === page.value) return
    // URL에 q/sort/page를 유지해서 공유/새로고침에 강함
    router.push({
        path: '/products',
        query: {
            q: q.value || undefined,
            sort: sort.value || undefined,
            page: String(n),
        },
    })
}
</script>

<style scoped>
.products-container {
    padding: 40px;
}

.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.summary {
    color: #111;
}

.sel {
    height: 36px;
    padding: 0 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
}

.empty {
    padding: 20px;
    text-align: center;
    color: #888;
}

.pager {
    display: flex;
    gap: 6px;
    justify-content: center;
    margin: 16px 0;
}

.pg-btn {
    min-width: 38px;
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid #ddd;
    background: #fff;
    cursor: pointer;
}

.pg-btn.active {
    background: #111827;
    color: #fff;
    border-color: #111827;
}

.pg-btn:disabled {
    opacity: .5;
    cursor: not-allowed;
}
</style>
