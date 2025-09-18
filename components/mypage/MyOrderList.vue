<template>
    <section class="orders-wrap">
        <h1 class="title">주문내역</h1>

        <div v-if="pending" class="empty">불러오는 중…</div>
        <div v-else-if="rows.length === 0" class="empty">주문이 없습니다.</div>

        <div v-else class="orders">
            <article v-for="it in rows" :key="it._id" class="order-card">
                <header class="order-head">
                    <time class="date">{{ fmtDate(it.createdAt) }}</time>
                    <span class="badge" :class="`st-${it.status}`">{{ labelStatus(it.status) }}</span>
                </header>

                <div class="order-body">
                    <div class="line">
                        <span class="lbl">주문번호</span>
                        <span class="val mono">{{ it._id }}</span>
                    </div>

                    <div class="line">
                        <span class="lbl">결제 금액</span>
                        <span class="val mono strong">{{ format(it.orderTotal ?? it.productsTotal ?? 0) }}</span>
                    </div>

                    <div class="line items-line">
                        <span class="lbl">품목</span>
                        <ul class="items">
                            <li v-for="li in it.items" :key="lineKey(li)" class="item">
                                <img v-if="li.imageUrl" class="thumb" :src="li.imageUrl" :alt="li.name"
                                    loading="lazy" />
                                <div class="info">
                                    <span class="name">{{ li.name }}</span>
                                    <span v-if="li.optionName" class="opt"> · {{ li.optionName }}</span>
                                    <span class="qty"> × {{ li.quantity }}</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </article>

            <!-- 페이지네이션 -->
            <nav class="pager">
                <button class="pg-btn" :disabled="page === 1" @click="go(1)">« 처음</button>
                <button class="pg-btn" :disabled="page === 1" @click="go(page - 1)">‹ 이전</button>

                <button v-for="n in pages" :key="n" class="pg-btn" :class="{ active: n === page }" @click="go(n)">
                    {{ n }}
                </button>

                <button class="pg-btn" :disabled="page === pagesCount" @click="go(page + 1)">다음 ›</button>
                <button class="pg-btn" :disabled="page === pagesCount" @click="go(pagesCount)">마지막 »</button>
            </nav>
        </div>
    </section>
</template>

<script setup lang="ts">
import { useOrder } from '@/composables/useOrder'
import type { Order } from '@/composables/useOrder'

type OrderStatus = 'pending' | 'paid' | 'shipping' | 'done' | 'canceled' | 'failed'
const STATUS_LABELS: Record<OrderStatus, string> = {
    pending: '결제대기',
    paid: '결제완료',
    shipping: '배송중',
    done: '배송완료',
    canceled: '취소',
    failed: '실패',
}
const labelStatus = (s: string) => STATUS_LABELS[s as OrderStatus] ?? s

const { listOrders } = useOrder()

// 페이지네이션 — 5개씩
const page = ref(1)
const limit = 5

// ✅ SSR일 때만 요청 쿠키를 그대로 전달
const ssrHeaders = useRequestHeaders(['cookie'])

// ✅ 서버/클라이언트 공용 호출 함수 (서버면 직접 $fetch로 쿠키 헤더 동봉)
async function fetchOrders() {
    if (import.meta.server) {
        return await $fetch('/api/orders', {
            query: { page: page.value, limit },
            headers: ssrHeaders,
        })
    }
    return await listOrders({ page: page.value, limit })
}

// 서버 데이터
type Meta = { page: number; limit: number; total: number; totalPages: number }
const rows = ref<Order[]>([])
const meta = ref<Meta>({ page: 1, limit, total: 0, totalPages: 1 })

// 단일 키 + watch로 갱신 (HMR 경고 회피)
const { data, pending } = await useAsyncData('my-orders', fetchOrders, { watch: [page] })

// 응답 반영
watch(data, (v) => {
    rows.value = v?.items ?? []
    meta.value = v?.meta ?? { page: 1, limit, total: 0, totalPages: 1 }
}, { immediate: true })

// 항상 최소 1페이지는 노출
const pagesCount = computed(() => Math.max(1, Number(meta.value.totalPages ?? 1)))

// [1]은 기본, 5개 초과면 [2] 자동 생성 (윈도우 5칸)
const pages = computed<number[]>(() => {
    const total = pagesCount.value
    const windowSize = 5
    const current = Math.min(page.value, total)
    let start = Math.max(1, current - Math.floor(windowSize / 2))
    let end = Math.min(total, start + windowSize - 1)
    start = Math.max(1, end - windowSize + 1)
    const arr: number[] = []
    for (let n = start; n <= end; n++) arr.push(n)
    if (arr.length === 0) arr.push(1)
    return arr
})

function go(n: number) {
    if (n < 1 || n > pagesCount.value || n === page.value) return
    page.value = n
}

// 가벼운 실시간 반영: 현재 페이지만 15초 간격으로 상태 동기화
const POLL_MS = 15000
let timer: any = null
async function refreshStatuses() {
    const res = await fetchOrders()
    const latest = Array.isArray(res?.items) ? res.items : []
    const map = new Map(latest.map(x => [String(x._id), x]))
    rows.value = rows.value.map(old => {
        const fresh = map.get(String(old._id))
        return fresh
            ? { ...old, status: fresh.status, orderTotal: fresh.orderTotal, items: fresh.items }
            : old
    })
}
onMounted(() => { timer = setInterval(refreshStatuses, POLL_MS) })
onUnmounted(() => { if (timer) clearInterval(timer) })

// 유틸
const lineKey = (li: any) => `${li.productId}::${li.optionName ?? ''}`
const format = (n: number) => (Number(n) || 0).toLocaleString('ko-KR') + '원'
const fmtDate = (d: string | Date) => {
    const dt = new Date(d)
    if (isNaN(+dt)) return '-'
    const z = (x: number) => String(x).padStart(2, '0')
    return `${dt.getFullYear()}-${z(dt.getMonth() + 1)}-${z(dt.getDate())}`
}
</script>

<style scoped>
.orders-wrap {
    display: grid;
    gap: 12px;
}

.title {
    font-size: 25px;
    font-weight: 600;
    letter-spacing: -0.2px;
}

.empty {
    padding: 20px;
    text-align: center;
    color: #888;
}

.orders {
    display: grid;
    gap: 12px;
}

/* 카드 */
.order-card {
    border: 1px solid #eee;
    border-radius: 14px;
    background: #fff;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, .03);
}

/* 상단바 */
.order-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    border-bottom: 1px solid #f2f2f2;
    background: #fafafa;
}

.date {
    font-weight: 700;
    color: #1f2937;
}

.badge {
    display: inline-block;
    padding: 4px 10px;
    font-size: 12px;
    border-radius: 999px;
    background: #eef2ff;
    color: #334155;
}

.badge.st-pending {
    background: #fff3cd;
    color: #8a6d3b;
}

.badge.st-paid {
    background: #e6ffed;
    color: #1a7f37;
}

.badge.st-shipping {
    background: #e7f1ff;
    color: #1e40af;
}

.badge.st-done {
    background: #eefdf3;
    color: #065f46;
}

.badge.st-canceled {
    background: #ffeaea;
    color: #9b1c1c;
}

.badge.st-failed {
    background: #f8d7da;
    color: #842029;
}

/* 본문 */
.order-body {
    padding: 14px 16px;
    display: grid;
    gap: 12px;
}

.line {
    display: grid;
    grid-template-columns: 90px 1fr;
    gap: 10px;
    align-items: start;
}

.lbl {
    color: #6b7280;
}

.val {
    color: #111827;
}

.mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.strong {
    font-weight: 700;
}

/* 품목 */
.items {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 10px;
}

.item {
    display: flex;
    gap: 10px;
    align-items: center;
}

.thumb {
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #eee;
}

.info {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    align-items: center;
}

.name {
    font-weight: 700;
}

.opt {
    color: #6b7280;
}

.qty {
    color: #374151;
}

/* 페이지네이션 */
.pager {
    display: flex;
    gap: 6px;
    justify-content: center;
    align-items: center;
    margin-top: 4px;
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
