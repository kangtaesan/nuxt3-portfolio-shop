<template>
    <div class="wrap">
        <!-- 필터 -->
        <div class="card filters">
            <div class="row">
                <label class="lbl">상태</label>
                <select v-model="filters.status" class="sel">
                    <option value="">전체</option>
                    <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
                </select>

                <label class="lbl">검색</label>
                <input v-model.trim="filters.q" class="inp" placeholder="주문자명, 주문번호 등" />

                <label class="lbl">시작일</label>
                <input v-model="filters.from" type="date" class="inp" />
                <label class="lbl">종료일</label>
                <input v-model="filters.to" type="date" class="inp" />

                <button class="btn primary" @click="applyFilters" :disabled="loading">검색</button>
                <button class="btn ghost" @click="resetFilters" :disabled="loading">초기화</button>
            </div>
        </div>

        <!-- 목록 -->
        <div class="card">
            <div v-if="loading" class="empty">불러오는 중…</div>

            <table v-else class="table">
                <thead>
                    <tr>
                        <th style="width: 160px">주문일</th>
                        <th class="mono">주문번호</th>
                        <th>주문자</th>
                        <th>품목</th>
                        <th style="width: 90px">상품수</th>
                        <th style="width: 140px">결제금액</th>
                        <th style="width: 140px">상태</th>
                        <th style="width: 90px">삭제</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-if="rows.length === 0">
                        <td class="empty" colspan="8">주문이 없습니다.</td>
                    </tr>

                    <tr v-for="it in rows" :key="it._id">
                        <td>{{ fmtDate(it.createdAt) }}</td>
                        <td class="mono">{{ it._id }}</td>
                        <td>{{ it.ordererName || '-' }}</td>

                        <!-- 품목을 바로 표시 -->
                        <td>
                            <ul class="items">
                                <li v-for="li in it.items" :key="lineKey(li)">
                                    <span class="name">{{ li.name }}</span>
                                    <span v-if="li.optionName" class="opt"> ({{ li.optionName }})</span>
                                    <span class="qty"> × {{ li.quantity }}</span>
                                </li>
                            </ul>
                        </td>

                        <td class="mono center">{{ it.items?.length ?? 0 }} 개</td>
                        <td class="mono strong">{{ format(it.orderTotal ?? 0) }}</td>

                        <!-- 상태 인라인 수정 -->
                        <td>
                            <div class="status-cell">
                                <button class="badge" :class="`st-${it.status}`" @click="toggleEditor(it)">
                                    {{ labelStatus(it.status) }}
                                </button>

                                <div v-if="editId === it._id" class="status-pop">
                                    <select v-model="editStatus" class="sel" @change="saveStatus(it)">
                                        <option v-for="s in statusOptions" :key="s.value" :value="s.value">
                                            {{ s.label }}
                                        </option>
                                    </select>
                                    <button class="btn ghost small" @click="cancelEdit">x</button>
                                </div>
                            </div>
                        </td>

                        <!-- 개별 삭제 -->
                        <td class="center">
                            <button class="link danger" @click="del(it)">삭제</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- 페이지네이션 -->
            <div class="pager" v-if="(meta.totalPages ?? 1) > 1">
                <button :disabled="filters.page <= 1" @click="go(filters.page - 1)">이전</button>
                <span>{{ meta.page }} / {{ meta.totalPages }}</span>
                <button :disabled="filters.page >= (meta.totalPages ?? 1)" @click="go(filters.page + 1)">다음</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useOrder } from '@/composables/useOrder'
import type { OrderStatus } from '@/composables/useOrder'

// ── 상태 라벨/옵션
const statusOptions: { value: OrderStatus, label: string }[] = [
    { value: 'pending', label: '결제대기' },
    { value: 'paid', label: '결제완료' },
    { value: 'shipping', label: '배송중' },
    { value: 'done', label: '배송완료' },
    { value: 'canceled', label: '취소' },
    { value: 'failed', label: '실패' },
]
const labelStatus = (s: string) => statusOptions.find(x => x.value === s)?.label ?? s

// ── 기존 composable (list, update, delete 사용)
const { listOrders, updateOrderStatus, deleteOrder } = useOrder()

// ── 상태
type UIFilters = {
    page: number; limit: number; status: '' | OrderStatus; q: string; from: string; to: string
}
const today = new Date(); const toISO = (d: Date) => d.toISOString().slice(0, 10)

const loading = ref(false)
const rows = ref<any[]>([])
const meta = reactive({ page: 1, limit: 10, total: 0, totalPages: 1 })
const filters = reactive<UIFilters>({
    page: 1, limit: 10, status: '', q: '',
    from: toISO(today), to: toISO(today),   // 기본값 오늘
})

// ── 인라인 상태 편집
const editId = ref<string | null>(null)
const editStatus = ref<OrderStatus>('pending')
function toggleEditor(it: any) {
    editId.value = (editId.value === it._id) ? null : it._id
    editStatus.value = it.status
}
function cancelEdit() { editId.value = null }

async function saveStatus(it: any) {
    const prev = it.status
    it.status = editStatus.value // 낙관적 업데이트
    try {
        await updateOrderStatus(it._id, editStatus.value)
    } catch (e) {
        it.status = prev
        alert('상태 변경 실패')
    } finally {
        editId.value = null
    }
}

// ── 삭제
async function del(it: any) {
    if (!confirm('이 주문을 삭제할까요?')) return
    try {
        await deleteOrder(it._id)
        await load()
    } catch (e) {
        alert('삭제 실패')
    }
}

// ── 목록 로드
async function load() {
    loading.value = true
    try {
        const { items, meta: m } = await listOrders({
            page: filters.page, limit: filters.limit,
            status: filters.status || undefined,
            q: filters.q || undefined,
            from: filters.from || undefined,
            to: filters.to || undefined,
        })
        rows.value = Array.isArray(items) ? items : []
        Object.assign(meta, m || { page: filters.page, limit: filters.limit, total: 0, totalPages: 1 })
    } finally {
        loading.value = false
    }
}

function applyFilters() { filters.page = 1; load() }
function resetFilters() {
    filters.page = 1; filters.status = ''; filters.q = ''
    filters.from = toISO(today); filters.to = toISO(today)
    load()
}
function go(p: number) { if (p < 1) return; if (meta.totalPages && p > meta.totalPages) return; filters.page = p; load() }

// ── 유틸
const lineKey = (li: any) => `${li.productId}::${li.optionName ?? ''}`
const format = (n: number) => (Number(n) || 0).toLocaleString('ko-KR') + '원'
const fmtDate = (d: string | Date) => {
    const dt = new Date(d)
    if (isNaN(+dt)) return '-'
    const z = (n: number) => String(n).padStart(2, '0')
    return `${dt.getFullYear()}-${z(dt.getMonth() + 1)}-${z(dt.getDate())} ${z(dt.getHours())}:${z(dt.getMinutes())}`
}

onMounted(load)
</script>

<style scoped>
.wrap {
    display: grid;
    gap: 12px;
}

.card {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 16px;
}

/* ── 필터 그리드 */
.filters .row {
    display: grid;
    grid-template-columns: 56px 140px 48px 1fr 56px 180px 56px 180px auto auto;
    gap: 10px;
    align-items: center;
}

.inp,
.sel,
.btn {
    height: 40px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1px solid #ddd;
    background: #fff;
    outline: none;
    box-sizing: border-box;
}

.btn.primary {
    background: #111827;
    color: #fff;
    border-color: #111827;
}

.btn.ghost {
    background: #fff;
}

.btn.small {
    height: 32px;
    padding: 0 10px;
}

input[type="date"].inp {
    appearance: none;
    -webkit-appearance: none;
    padding: 0 10px;
    line-height: 40px;
    min-width: 180px;
}

input[type="date"]::-webkit-calendar-picker-indicator {
    opacity: 1;
    padding: 0 4px;
    margin: 0;
    cursor: pointer;
}

@-moz-document url-prefix() {
    input[type="date"].inp {
        padding-top: 8px;
        padding-bottom: 8px;
        line-height: normal;
    }
}

/* ── 표 */
.table {
    width: 100%;
    border-collapse: collapse;
}

.table th,
.table td {
    padding: 10px 12px;
    border-bottom: 1px solid #eee;
    text-align: left;
    vertical-align: top;
}

.table th {
    color: #666;
    font-weight: 600;
}

.mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.center {
    text-align: center;
}

.strong {
    font-weight: 700;
}

.empty {
    padding: 20px;
    text-align: center;
    color: #888;
}

/* 품목 리스트 */
.items {
    list-style: none;
    margin: 0;
    padding: 0;
}

.items li {
    line-height: 1.6;
}

.items .name {
    font-weight: 600;
}

.items .opt {
    color: #666;
}

.items .qty {
    color: #444;
}

/* 상태 뱃지 / 팝오버 */
.badge {
    display: inline-block;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    background: #f2f2f2;
    color: #555;
    border: none;
    cursor: pointer;
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

.status-cell {
    position: relative;
    display: inline-block;
}

.status-pop {
    position: absolute;
    z-index: 10;
    top: 36px;
    left: 0;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 8px;
    display: flex;
    gap: 6px;
    align-items: center;
    box-shadow: 0 6px 20px rgba(0, 0, 0, .08);
}

/* 페이지네이션 */
.pager {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    padding-top: 12px;
}

.pager button {
    padding: 8px 12px;
    border-radius: 8px;
}

/* 링크/삭제 */
.link {
    color: #4f46e5;
    font-weight: 600;
    background: none;
    border: none;
    cursor: pointer;
}

.link.danger {
    color: #dc2626;
}

/* 날짜 input 파란 하이라이트(텍스트 선택) 방지 */
input[type="date"].inp {
    /* 텍스트 선택/드래그 금지 */
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;

    /* 깜빡이는 캐럿(커서) 숨김 */
    caret-color: transparent;

    /* 모바일 탭 하이라이트 제거 */
    -webkit-tap-highlight-color: transparent;
}

/* 선택 영역 색 제거(브라우저별) */
input[type="date"].inp::selection {
    background: transparent;
}

input[type="date"].inp::-moz-selection {
    background: transparent;
}

/* 포커스 시 테두리/배경 유지 */
input[type="date"].inp:focus {
    outline: none;
}

/* WebKit: 날짜 편집 영역 선택 방지 + 배경 투명 */
input[type="date"].inp::-webkit-datetime-edit,
input[type="date"].inp:focus::-webkit-datetime-edit,
input[type="date"].inp::-webkit-datetime-edit-fields-wrapper,
input[type="date"].inp::-webkit-datetime-edit-text,
input[type="date"].inp::-webkit-datetime-edit-year-field,
input[type="date"].inp::-webkit-datetime-edit-month-field,
input[type="date"].inp::-webkit-datetime-edit-day-field {
    background: transparent;
    color: inherit;
    -webkit-user-select: none;
    user-select: none;
}

@media all and (max-width: 1100px) {
    .filters .row {
        grid-template-columns: 64px 1fr 48px 1fr;
        /* 상태/검색 2열로 단순화 */
        gap: 8px;
    }

    /* 날짜는 한 줄 아래로 */
    .filters .row .lbl:nth-of-type(3),
    /* 시작일 label */
    .filters .row .lbl:nth-of-type(4),
    /* 종료일 label */
    .filters .row .inp[type="date"] {
        grid-column: 1 / -1;
        /* 전체폭 */
    }

    /* 버튼도 아래로 */
    .filters .row .btn {
        grid-column: auto;
    }

    /* 테이블 좁은 화면 최적화: 주문번호/상품수/삭제 숨김 */
    .table th:nth-child(2),
    .table td:nth-child(2),
    /* 주문번호 */
    .table th:nth-child(5),
    .table td:nth-child(5),
    /* 상품수 */
    .table th:nth-child(8),
    .table td:nth-child(8)

    /* 삭제 */
        {
        display: none;
    }

    /* 날짜/금액은 줄바꿈 방지 */
    .table td:nth-child(1),
    .table td:nth-child(6) {
        white-space: nowrap;
    }
}
</style>
