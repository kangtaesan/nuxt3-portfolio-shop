<template>
    <section class="cs-board">
        <h2 class="title">고객센터</h2>
        <!-- 상단 헤더: 제목 가운데, 왼쪽 총 개수, 오른쪽 작성 버튼 -->
        <header class="cs-head">
            <div class="left">전체 {{ meta.total }}</div>

            <div class="right">
                <NuxtLink to="/cs/cs-create" class="btn primary">작성하기</NuxtLink>
            </div>
        </header>

        <!-- 1페이지에서만 상단 고정 안내(있을 때) -->
        <section v-if="page === 1 && notice.length" class="notice-stack">
            <article v-for="n in notice" :key="n._id" class="notice">
                <i class="fa-solid fa-bullhorn" aria-hidden="true"></i>
                <div class="notice-body">
                    <strong class="notice-title">{{ n.title }}</strong>
                    <p class="notice-text">{{ n.message }}</p>
                    <!-- 필요하면 날짜도 노출 -->
                    <small class="notice-date">{{ new Date(n.createdAt).toLocaleDateString() }}</small>
                </div>
            </article>
        </section>

        <!-- 목록 -->
        <ul v-if="items.length" class="rows">
            <li v-for="p in items" :key="p._id" class="row">
                <!-- 좌측: 상태 -->
                <span class="badge" :data-status="p.status">
                    {{ labelStatus(p.status) }}
                </span>

                <!-- 가운데: 제목/하위 정보 -->
                <div class="main">
                    <p v-if="p.nickname" class="sub">{{ p.nickname }}</p>
                    <NuxtLink :to="`/cs/${p._id}`" class="row-title" :title="p.title">
                        {{ p.title }}
                    </NuxtLink>
                    <p v-if="p.orderItemTitle" class="sub">
                        {{ p.orderItemTitle }}
                    </p>
                </div>

                <!-- 우측: 작성일 -->
                <time class="date" :datetime="iso(p.createdAt)">
                    {{ fmt(p.createdAt) }}
                </time>
            </li>
        </ul>

        <!-- 빈 상태 -->
        <div v-else class="empty">
            <p>등록된 문의가 없습니다.</p>
        </div>

        <!-- 페이지네이션 -->
        <div class="pager" v-if="meta.totalPages">
            <button class="btn" :disabled="page <= 1" @click="go(page - 1)">이전</button>
            <span class="sep">{{ page }} / {{ meta.totalPages }}</span>
            <button class="btn" :disabled="page >= meta.totalPages" @click="go(page + 1)">다음</button>
        </div>

        <p v-if="err" class="err">{{ err }}</p>
    </section>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

// page 쿼리
const page = computed(() => Number(route.query.page ?? 1))

// 목록/메타
const items = ref<any[]>([])
const meta = ref<{ total: number; totalPages: number }>({ total: 0, totalPages: 1 })

// 상단 고정 안내(1페이지에서만)
const notice = ref<any[]>([])

const err = ref('')
const limit = 20

onMounted(fetchAll)
watch(() => route.query.page, fetchAll)

async function fetchAll() {
    err.value = ''
    try {
        // 목록
        const { items: list = [], meta: m = { total: 0, totalPages: 1 } } =
            await $fetch<{ items: any[]; meta: any }>('/api/cs', {
                query: { page: page.value, limit }
            })
        items.value = list
        Object.assign(meta.value, m)

        // 공지: 있으면 노출, 없으면 무시
        if (page.value === 1) {
            try {
                const response = await $fetch<{ items: any[] }>('/api/cs/notice', {
                    query: { limit: 3, enabled: 'true' } // 최신 3개
                })
                notice.value = response.items ?? []
            } catch {
                notice.value = []
            }
        } else {
            notice.value = []
        }
    } catch (e: any) {
        err.value = e?.data?.message || '목록을 불러오지 못했습니다.'
    }
}

function go(p: number) {
    router.push({ query: { ...route.query, page: p } })
}

function fmt(d?: string | Date) {
    if (!d) return ''
    return new Date(d).toLocaleDateString()
}
function iso(d?: string | Date) {
    if (!d) return ''
    return new Date(d).toISOString()
}
function labelStatus(s: string) {
    return s === 'answered' ? '답변 완료' : '답변 대기'
}
</script>

<style scoped>
/* 섹션 기본 */
.cs-board {
    padding: 64px;
}

/* 상단 헤더: 가운데 제목, 좌우 정보 */
.cs-head {
    position: relative;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    margin-bottom: 12px;
}

.title {
    font-size: 30px;
    font-weight: 700;
    margin-bottom: 50px;
}

.cs-head .left {
    grid-column: 1 / 2;
    color: #6b7280;
    font-size: 14px;
}

.cs-head .right {
    grid-column: 3 / 4;
    display: flex;
    justify-content: flex-end;
}

/* 상단 안내(공지) */
.notice-stack {
    margin: 12px 0 16px;
    display: grid;
    gap: 8px;
}

.notice {
    display: grid;
    grid-template-columns: 24px 1fr;
    align-items: start;
    padding: 12px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #f9fafb;
}

.notice i {
    margin-top: 2px;
    color: #0ea5e9;
}

.notice-title {
    font-weight: 700;
}

.notice-text {
    margin: 4px 0 0;
    color: #4b5563;
    line-height: 1.4;
}

/* 리스트: 상태 / 제목블럭 / 날짜 의 3열 */
.rows {
    margin: 0;
    padding: 0;
    list-style: none;
    border-top: 1px solid #eee;
}

.row {
    display: grid;
    grid-template-columns: 92px 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 12px 4px;
    border-bottom: 1px solid #eee;
}

/* 상태 뱃지 */
.badge {
    justify-self: start;
    font-size: 12px;
    border-radius: 999px;
    padding: 4px 10px;
    border: 1px solid #e5e7eb;
    background: #f3f4f6;
    color: #374151;
}

.badge[data-status="answered"] {
    color: #065f46;
    background: #ecfdf5;
    border-color: #a7f3d0;
}

/* 가운데 본문 */
.main {
    min-width: 0;
}

.row-title {
    display: inline-block;
    max-width: 100%;
    font-weight: 700;
    color: #111827;
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.row-title:hover {
    text-decoration: underline;
}

.sub {
    margin: 2px 0 0;
    color: #6b7280;
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 우측 날짜 */
.date {
    color: #6b7280;
    font-size: 13px;
}

/* 빈 상태 */
.empty {
    border: 1px dashed #e5e7eb;
    border-radius: 10px;
    padding: 28px 16px;
    text-align: center;
    color: #9ca3af;
    margin-top: 12px;
}

.empty .btn {
    margin-top: 8px;
}

/* 페이저/버튼/에러 */
.pager {
    display: flex;
    justify-content: center;
    gap: 10px;
    align-items: center;
    margin-top: 12px;
}

.pager .sep {
    color: #6b7280;
}

.btn {
    font-size: 0.85rem;
    padding: 10px 16px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: #fff;
    cursor: pointer;
    text-decoration: none;
}

.btn.primary {
    background: #111827;
    color: #fff;
    border-color: #111827;
}

.btn:disabled {
    opacity: .5;
    cursor: not-allowed;
}

.err {
    color: #dc2626;
    margin-top: 8px;
}

/* 반응형 */
@media (max-width: 640px) {
    .row {
        grid-template-columns: 84px 1fr;
    }

    .date {
        grid-column: 1 / -1;
        justify-self: end;
    }
}
</style>
