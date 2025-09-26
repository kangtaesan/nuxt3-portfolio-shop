<template>
    <section class="admin-cs">
        <header class="head">
            <h1 class="title">고객센터 관리</h1>
            <div class="tools">
                <NuxtLink class="btn primary" to="/admin/create-notice">새 공지 작성</NuxtLink>
            </div>
        </header>

        <!-- 공지 목록 -->
        <article class="card">
            <div class="card-head">
                <h2>공지 목록</h2>
                <div class="filters">
                    <select v-model="noticeFilter" class="sel">
                        <option value="">전체</option>
                        <option value="true">노출</option>
                        <option value="false">숨김</option>
                    </select>
                </div>
            </div>

            <ul class="notice-list" v-if="notices.length">
                <li v-for="n in notices" :key="n._id" class="row">
                    <div class="left">
                        <span class="badge" :data-enabled="String(!!n.enabled)">{{ n.enabled ? '노출' : '숨김' }}</span>
                        <strong class="tt">{{ n.title }}</strong>
                        <small class="date">{{ fmt(n.createdAt) }}</small>
                    </div>
                    <div class="right">
                        <button class="btn" @click="toggleNotice(n)" :disabled="busyId === n._id">
                            {{ n.enabled ? '숨김' : '노출' }}
                        </button>
                        <NuxtLink class="btn" :to="{ path: '/admin/create-notice', query: { id: n._id } }">편집</NuxtLink>
                        <button class="btn danger" @click="removeNotice(n)" :disabled="busyId === n._id">삭제</button>
                    </div>
                </li>
            </ul>
            <p v-else class="muted">등록된 공지가 없습니다.</p>

            <div class="pager" v-if="noticeMeta.totalPages">
                <button class="btn" :disabled="noticePage <= 1" @click="goNotice(noticePage - 1)">이전</button>
                <span class="sep">{{ noticePage }} / {{ noticeMeta.totalPages }}</span>
                <button class="btn" :disabled="noticePage >= noticeMeta.totalPages"
                    @click="goNotice(noticePage + 1)">다음</button>
            </div>
        </article>

        <!-- 답변 대기 -->
        <article class="card">
            <div class="card-head">
                <h2>답변 대기</h2>
            </div>

            <ul class="cs-list" v-if="pending.items.length">
                <li v-for="p in pending.items" :key="p._id" class="row">
                    <div class="left">
                        <span class="badge pending">대기</span>
                        <NuxtLink class="tt" :to="`/cs/${p._id}`" target="_blank">{{ p.title }}</NuxtLink>
                        <span class="sub">{{ p.nickname }}</span>
                        <small class="date">{{ fmt(p.createdAt) }}</small>
                    </div>
                    <div class="right" v-if="replyOpenId !== p._id">
                        <button class="btn" @click="openReply(p)">답변</button>
                        <button class="btn danger" @click="removeCs(p)" :disabled="busyId === p._id">삭제</button>
                    </div>

                    <!-- 인라인 답변 박스 -->
                    <div class="reply" v-if="replyOpenId === p._id">
                        <textarea v-model.trim="replyMsg" rows="4" class="ta" placeholder="답변 내용을 입력하세요."></textarea>
                        <div class="reply-actions">
                            <button class="btn" @click="closeReply">취소</button>
                            <button class="btn primary" @click="submitReply(p)"
                                :disabled="!replyMsg || busyId === p._id">등록</button>
                        </div>
                    </div>
                </li>
            </ul>
            <p v-else class="muted">답변 대기 중인 문의가 없습니다.</p>

            <div class="pager" v-if="pending.meta.totalPages">
                <button class="btn" :disabled="pendingPage <= 1" @click="goPending(pendingPage - 1)">이전</button>
                <span class="sep">{{ pendingPage }} / {{ pending.meta.totalPages }}</span>
                <button class="btn" :disabled="pendingPage >= pending.meta.totalPages"
                    @click="goPending(pendingPage + 1)">다음</button>
            </div>
        </article>

        <article class="card">
            <div class="card-head">
                <h2>답변 완료</h2>
            </div>

            <ul class="cs-list" v-if="answered.items.length">
                <li v-for="p in answered.items" :key="p._id" class="row">
                    <div class="left">
                        <span class="badge done">완료</span>
                        <NuxtLink class="tt" :to="`/cs/${p._id}`" target="_blank">{{ p.title }}</NuxtLink>
                        <span class="sub">{{ p.nickname }}</span>
                        <small class="date">{{ fmt(p.createdAt) }}</small>
                    </div>

                    <!-- 편집 중이 아닐 때만 버튼 노출 -->
                    <div class="right" v-if="replyEditOpenId !== p._id">
                        <button class="btn" @click="openEdit(p)" :disabled="busyId === p._id">편집</button>
                        <button class="btn danger" @click="removeCsAnswered(p)" :disabled="busyId === p._id">삭제</button>
                    </div>

                    <!-- 인라인 편집 박스 (최근 관리자 답변 메시지) -->
                    <div class="reply" v-else>
                        <textarea v-model.trim="replyEditMsg" rows="4" class="ta"
                            placeholder="답변 내용을 수정하세요."></textarea>
                        <div class="reply-actions">
                            <button class="btn" @click="closeEdit">취소</button>
                            <button class="btn primary" @click="saveEdit(p)"
                                :disabled="!replyEditMsg || busyId === p._id">저장</button>
                        </div>
                    </div>
                </li>
            </ul>

            <p v-else class="muted">답변 완료된 문의가 없습니다.</p>

            <div class="pager" v-if="answered.meta.totalPages">
                <button class="btn" :disabled="answeredPage <= 1" @click="goAnswered(answeredPage - 1)">이전</button>
                <span class="sep">{{ answeredPage }} / {{ answered.meta.totalPages }}</span>
                <button class="btn" :disabled="answeredPage >= answered.meta.totalPages"
                    @click="goAnswered(answeredPage + 1)">다음</button>
            </div>
        </article>

        <p v-if="err" class="err">{{ err }}</p>
    </section>
</template>

<script setup lang="ts">
const router = useRouter()
const route = useRoute()

// 공지
const notices = ref<any[]>([])
const noticeMeta = ref({ totalPages: 1 })
const noticePage = computed(() => Number(route.query.np ?? 1))
const noticeFilter = ref(String(route.query.nf ?? ''))
// 답변대기
const pending = reactive<{ items: any[]; meta: any }>({ items: [], meta: { totalPages: 1 } })
const pendingPage = computed(() => Number(route.query.cp ?? 1))
// 답변완료
const answered = reactive({ items: [] as any[], meta: { totalPages: 1, total: 0 } })
const answeredPage = ref(1)
const answeredLimit = 20
const replyEditOpenId = ref<string | null>(null)
const replyEditMsg = ref('')

const busyId = ref<string | null>(null)
const replyOpenId = ref<string | null>(null)
const replyMsg = ref('')
const err = ref('')

onMounted(refreshAll)
watch(() => [route.query.np, route.query.cp, route.query.nf], refreshAll)

async function refreshAll() {
    err.value = ''
    try {
        await Promise.all([loadNotices(), loadPending(), loadAnswered()])
    } catch (e: any) {
        err.value = e?.data?.message || '불러오기 실패'
    }
}

async function loadNotices() {
    const { items, meta } = await $fetch<{ items: any[]; meta: any }>('/api/cs/notice', {
        query: { page: noticePage.value, limit: 10, enabled: noticeFilter.value || undefined }
    })
    notices.value = items
    noticeMeta.value = meta
}
function goNotice(p: number) { router.push({ query: { ...route.query, np: p } }) }


// toggle
async function toggleNotice(n: any) {
    busyId.value = n._id
    try {
        const next = !n.enabled
        const { doc }: any = await $fetch(`/api/cs/notice/${n._id}`, { method: 'PATCH', body: { enabled: next } })
        Object.assign(n, doc)
    } finally { busyId.value = null }
}
async function removeNotice(n: any) {
    if (!confirm('삭제하시겠습니까?')) return
    busyId.value = n._id
    try {
        await $fetch(`/api/cs/notice/${n._id}`, { method: 'DELETE' })
        await loadNotices()
    } finally { busyId.value = null }
}

// pending
async function loadPending() {
    const { items, meta } = await $fetch<{ items: any[]; meta: any }>('/api/cs', {
        query: { status: 'pending', page: pendingPage.value, limit: 20 }
    })
    pending.items = items
    pending.meta = meta
}
function goPending(p: number) { router.push({ query: { ...route.query, cp: p } }) }

// answered
async function loadAnswered() {
    const res = await $fetch<{ items: any[]; meta: any }>('/api/cs', {
        query: { status: 'answered', page: answeredPage.value, limit: answeredLimit }
    })
    answered.items = res.items || []
    answered.meta = res.meta || { totalPages: 1, total: 0 }
}
function goAnswered(p: number) { answeredPage.value = p; loadAnswered() }

// reply
function openReply(p: any) { replyOpenId.value = p._id; replyMsg.value = '' }
function closeReply() { replyOpenId.value = null; replyMsg.value = '' }

async function submitReply(p: any) {
    if (!replyMsg.value.trim()) return
    busyId.value = p._id
    try {
        await $fetch(`/api/cs/${p._id}/reply`, { method: 'POST', body: { message: replyMsg.value } })
        closeReply()
        await ([loadPending(), loadAnswered()]) // answered로 이동되어 목록에서 빠짐
    } finally { busyId.value = null }
}

async function removeCs(p: any) {
    if (!confirm('삭제하시겠습니까?')) return
    busyId.value = p._id
    try {
        await $fetch(`/api/cs/${p._id}`, { method: 'DELETE' })
        await ([loadPending(), loadAnswered()])
    } finally { busyId.value = null }
}

// 최근(마지막) 답변 메시지 가져오기 유틸
function getLastReplyMessage(p: any) {
    const arr = Array.isArray(p?.replies) ? p.replies : []
    const last = arr.length ? arr[arr.length - 1] : null
    return String(last?.message ?? '')
}

// 편집 열기
function openEdit(p: any) {
    replyEditOpenId.value = p._id
    replyEditMsg.value = getLastReplyMessage(p)
}

// 편집 닫기
function closeEdit() {
    replyEditOpenId.value = null
    replyEditMsg.value = ''
}

// 편집 저장 (최근 답변 수정)
async function saveEdit(p: any) {
    if (!replyEditMsg.value.trim()) return
    busyId.value = p._id
    try {
        await $fetch(`/api/cs/${p._id}/reply`, {
            method: 'PATCH',
            body: { message: replyEditMsg.value }
        })
        closeEdit()
        await loadAnswered()
    } finally {
        busyId.value = null
    }
}

// 답변완료 목록에서 삭제(대기 쪽과 별도로 유지)
async function removeCsAnswered(p: any) {
    if (!confirm('삭제하시겠습니까?')) return
    busyId.value = p._id
    try {
        await $fetch(`/api/cs/${p._id}`, { method: 'DELETE' })
        await loadAnswered()
    } finally {
        busyId.value = null
    }
}

function fmt(d: string) { try { return new Date(d).toLocaleString() } catch { return d } }
</script>

<style scoped>
.admin-cs {
    max-width: 980px;
    margin: 24px auto 80px;
    padding: 0 16px;
}

.head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.title {
    font-size: 22px;
    font-weight: 800;
}

.tools {
    display: flex;
    gap: 8px;
}

.card {
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 16px;
    margin-top: 16px;
}

.card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}

.sel {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 8px 10px;
}

.notice-list,
.cs-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 6px;
    border-bottom: 1px dashed #eee;
}

.row:last-child {
    border-bottom: 0;
}

.left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.right {
    display: flex;
    gap: 6px;
}

.tt {
    font-weight: 700;
    text-decoration: none;
    color: #000;
}

.sub {
    color: #6b7280;
}

.date {
    color: #9ca3af;
}

.badge {
    display: inline-flex;
    align-items: center;
    height: 26px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 12px;
    border: 1px solid #e5e7eb;
    background: #fafafa;
}

.badge[data-enabled="true"] {
    background: #ecfdf5;
    border-color: #10b98155;
    color: #065f46;
}

.badge[data-enabled="false"] {
    background: #f9fafb;
    color: #6b7280;
}

.badge.pending {
    background: #f3f4f6;
    color: #374151;
}

.reply {
    width: 100%;
    margin-top: 8px;
    padding: 10px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fafafa;
}

.ta {
    width: 92%;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 10px 12px;
    background: #fff;
}

.reply-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
}

.pager {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 12px;
}

.sep {
    color: #6b7280;
}

.btn {
    height: 36px;
    line-height: 36px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: #fff;
    cursor: pointer;
    text-decoration: none;
    color: #333;
    font-size: 0.8rem;
}

.btn.primary {
    background: #111827;
    color: #fff;
    border-color: #111827;
}

.btn.danger {
    border-color: #ef4444;
    color: #ef4444;
}

.muted {
    color: #9ca3af;
    padding: 12px 4px;
}

.err {
    margin-top: 12px;
    color: #dc2626;
}
</style>
