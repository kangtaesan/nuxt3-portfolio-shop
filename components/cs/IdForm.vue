<template>
    <section class="cs-detail" v-if="doc">
        <header class="head">
            <h1 class="title">{{ doc.title }}</h1>
            <div class="sub">
                <span class="writer">{{ doc.nickname }}</span>
                <span class="dot" aria-hidden="true">·</span>
                <time class="date">{{ fmt(doc.createdAt) }}</time>
                <span class="badge" :data-status="doc.status">{{ labelStatus(doc.status) }}</span>
            </div>
        </header>

        <article class="body" v-text="doc.content"></article>

        <!-- 답글 영역 -->
        <section class="replies">
            <h3 class="rtitle">
                답글 <span class="cnt">({{ replies.length }})</span>
            </h3>

            <div v-if="replies.length" class="rlist">
                <div v-for="r in replies" :key="String(r._id || r.createdAt)" class="reply">
                    <div class="rhead">
                        <strong class="rname">{{ r.adminName || '관리자' }}</strong>
                        <span class="dot" aria-hidden="true">·</span>
                        <time class="rdate">{{ fmt(r.createdAt) }}</time>
                    </div>
                    <p class="rmsg">{{ r.message }}</p>
                </div>
            </div>

            <p v-else class="rempty">등록된 답글이 없습니다.</p>
        </section>

        <footer class="foot">
            <div class="left">
                <NuxtLink to="/cs" class="btn ghost">목록으로</NuxtLink>
            </div>
            <div class="actions" v-if="canEdit">
                <NuxtLink :to="{ path: '/cs/cs-create', query: { id: doc._id } }" class="btn">수정</NuxtLink>
                <button class="btn danger" @click="remove" :disabled="busy">삭제</button>
            </div>
        </footer>

        <p v-if="err" class="err">{{ err }}</p>
    </section>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const doc = ref<any | null>(null)
const err = ref('')
const busy = ref(false)

onMounted(fetchOne)

async function fetchOne() {
    err.value = ''
    try {
        doc.value = await $fetch(`/api/cs/${route.params.id}`)
    } catch (e: any) {
        err.value = e?.data?.message || '문서를 불러오지 못했어요.'
    }
}

const replies = computed<any[]>(() => Array.isArray(doc.value?.replies) ? doc.value!.replies : [])

const canEdit = computed(() => {
    // 서버가 내려주는 권한 플래그 우선 사용
    if (!doc.value) return false
    if (typeof doc.value._canEdit === 'boolean') return doc.value._canEdit
    if (typeof doc.value._isOwner === 'boolean') return doc.value._isOwner
    return false
})

function fmt(d: string) {
    try { return new Date(d).toLocaleString() } catch { return d }
}
function labelStatus(s: string) {
    return s === 'answered' ? '답변완료' : '답변대기'
}

async function remove() {
    if (!doc.value) return
    if (!confirm('삭제하시겠습니까?')) return
    busy.value = true
    err.value = ''
    try {
        await $fetch(`/api/cs/${doc.value._id}`, { method: 'DELETE' })
        router.push('/cs')
    } catch (e: any) {
        err.value = e?.data?.message || '삭제 실패'
    } finally {
        busy.value = false
    }
}
</script>

<style scoped>
.cs-detail {
    max-width: 960px;
    margin: 32px auto 80px;
    padding: 0 16px;
}

/* 헤더 */
.head {
    margin-bottom: 16px;
}

.title {
    font-size: 24px;
    font-weight: 800;
    line-height: 1.35;
    margin: 0 0 8px;
    word-break: break-word;
}

.sub {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6b7280;
    /* slate-500 */
    font-size: 14px;
}

.dot {
    opacity: .6;
}

.badge {
    margin-left: 8px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 12px;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
}

.badge[data-status="answered"] {
    border-color: #22c55e33;
    background: #22c55e1a;
    color: #15803d;
}

.badge[data-status="pending"] {
    border-color: #f59e0b33;
    background: #f59e0b1a;
    color: #b45309;
}

/* 본문 */
.body {
    white-space: pre-wrap;
    word-break: break-word;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 18px;
    min-height: 160px;
}

/* replies */
.replies {
    margin-top: 20px;
    padding: 20px 0;
}

.rtitle {
    margin: 0 0 12px;
    font-size: 16px;
    font-weight: 700;
}

.rtitle .cnt {
    font-weight: 600;
    color: #6b7280;
}

.rlist {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.reply {
    padding: 14px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #fff;
}

.rhead {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #6b7280;
    font-size: 13px;
    margin-bottom: 6px;
}

.rname {
    color: #111827;
    font-weight: 700;
    font-size: 13px;
}

.rdate {
    font-variant-numeric: tabular-nums;
}

.rmsg {
    margin: 0;
    color: #111827;
    white-space: pre-wrap;
    line-height: 1.7;
}

.rempty {
    margin: 8px 0 0;
    color: #9ca3af;
    font-size: 14px;
}


/* 푸터/버튼 */
.foot {
    margin-top: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.left {
    display: flex;
    gap: 8px;
}

.actions {
    display: flex;
    gap: 8px;
}

.btn {
    height: 36px;
    line-height: 36px;
    padding: 0 14px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: #fff;
    cursor: pointer;
    font-size: 14px;
    text-decoration: none;
    color: #333;
}

.btn:hover {
    background: #f9fafb;
}

.btn.ghost {
    background: #f9fafb;
}

.btn.danger {
    color: #fff;
    background: #dc2626;
    border-color: #dc2626;
}

.btn.danger:disabled {
    opacity: .6;
    cursor: not-allowed;
}

/* 에러 메시지 */
.err {
    margin-top: 12px;
    color: #dc2626;
    font-size: 14px;
}
</style>
