<template>
    <section class="cs-form">
        <h2 class="h2">{{ isEdit ? '문의 수정' : '문의 작성' }}</h2>

        <!-- ✅ 버튼을 form 안으로 이동 -->
        <form class="grid" @submit.prevent="onSubmit">
            <label class="lbl">제목</label>
            <input class="inp" v-model.trim="form.title" type="text" required placeholder="제목을 입력하세요" />

            <label class="lbl">주문 선택(선택)</label>
            <div class="row">
                <!-- 셀렉트는 인풋과 동일 폭을 위해 class="inp" 유지 -->
                <select class="inp" v-model="form.orderId" :disabled="loadingOrders || !!orderErr">
                    <option value="">선택 안함</option>
                    <option v-for="o in orders" :key="o._id" :value="o._id">{{ orderLabel(o) }}</option>
                </select>
                <small v-if="loadingOrders" class="muted">불러오는 중…</small>
                <small v-else-if="orderErr" class="err">{{ orderErr }}</small>
            </div>

            <label class="lbl">내용</label>
            <textarea class="ta" v-model.trim="form.content" rows="10" required placeholder="문의 내용을 작성하세요."></textarea>

            <!-- ✅ grid 내부, 오른쪽 끝 정렬 -->
            <div class="actions">
                <button class="btn" type="button" @click="onCancel" :disabled="saving">취소</button>
                <button class="btn primary" type="submit" :disabled="saving">{{ isEdit ? '수정 저장' : '작성' }}</button>
            </div>
        </form>

        <p v-if="err" class="err">{{ err }}</p>
    </section>
</template>

<script setup lang="ts">
type OrderLite = { _id: string; createdAt: string; items: { name: string }[]; totalQty?: number }

const route = useRoute()
const router = useRouter()

const saving = ref(false)
const err = ref('')

const orders = ref<OrderLite[]>([])
const loadingOrders = ref(false)
const orderErr = ref('')

const form = reactive({ title: '', content: '', orderId: '' })

/** 수정 모드: ?id= 값이 있으면 true */
const editId = computed(() => String(route.query.id ?? '').trim())
const isEdit = computed(() => !!editId.value)

onMounted(async () => {
    await Promise.all([loadOrders(), loadIfEdit()])
})

/** (수정) 기존 문서 불러오기 → 폼 채우기 */
async function loadIfEdit() {
    if (!isEdit.value) return
    err.value = ''
    try {
        const doc: any = await $fetch(`/api/cs/${editId.value}`)
        form.title = doc?.title ?? ''
        form.content = doc?.content ?? ''
        form.orderId = doc?.orderId ?? ''
    } catch (e: any) {
        err.value = e?.data?.message || '문서를 불러오지 못했어요.'
    }
}

/** 나의 주문 간단 목록 */
async function loadOrders() {
    loadingOrders.value = true
    orderErr.value = ''
    try {
        const { items } = await $fetch<{ items: OrderLite[]; meta: any }>(
            '/api/orders',
            { query: { mine: 1, limit: 50 } }
        )
        orders.value = items ?? []
    } catch (e: any) {
        orderErr.value = e?.data?.message || '주문 목록을 불러오지 못했어요.'
        orders.value = []
    } finally {
        loadingOrders.value = false
    }
}

function orderLabel(o: OrderLite) {
    const first = o.items?.[0]?.name ?? '품목'
    const more = (o.totalQty ?? o.items?.length ?? 1) - 1
    const tail = more > 0 ? ` 외 ${more}건` : ''
    const date = new Date(o.createdAt).toLocaleDateString()
    return `${first}${tail} · ${date} · ${o._id.slice(0, 8)}…`
}

/** 공통 유효성 */
function validate() {
    if (!form.title.trim()) return '제목을 입력하세요.'
    if (!form.content.trim()) return '내용을 입력하세요.'
    return ''
}

/** 저장(신규/수정 분기) */
async function onSubmit() {
    err.value = ''
    const v = validate()
    if (v) { err.value = v; return }

    saving.value = true
    try {
        const body: Record<string, any> = {
            title: form.title.trim(),
            content: form.content.trim()
        }
        // 선택 안함은 빈 문자열 → orderId 제외
        if (String(form.orderId || '').trim()) body.orderId = String(form.orderId).trim()

        if (isEdit.value) {
            // 수정: PATCH /api/cs/:id
            await $fetch(`/api/cs/${editId.value}`, { method: 'PATCH', body })
            alert('수정되었습니다.')
            router.push(`/cs/${editId.value}`)
        } else {
            // 생성: POST /api/cs/create
            await $fetch('/api/cs/create', { method: 'POST', body })
            alert('등록되었습니다.')
            router.push('/cs')
        }
    } catch (e: any) {
        err.value = e?.data?.message || (isEdit.value ? '수정 실패' : '등록 실패')
    } finally {
        saving.value = false
    }
}

function onCancel() {
    // 취소: 수정이면 상세, 신규면 목록
    if (isEdit.value && editId.value) router.push(`/cs/${editId.value}`)
    else router.push('/cs')
}
</script>

<style scoped>
.cs-form {
    max-width: 720px;
    margin: 32px auto 80px;
    padding: 0 16px;
}

.h2 {
    font-size: 20px;
    font-weight: 800;
    margin: 0 0 16px;
}

.grid {
    display: grid;
    grid-template-columns: 140px minmax(0, 1fr);
    gap: 12px;
    align-items: start;
}

.lbl {
    color: #6b7280;
    margin-top: 6px;
}

.row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.inp,
.ta,
select.inp {
    border: 1px solid #e5e7eb;
    background: #fff;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
    line-height: 1.4;
}

select.inp {
    height: 40px;
    width: 100%;
}

/* 텍스트 영역 높이 */
.ta {
    min-height: 220px;
}

.actions {
    grid-column: 2 / -1;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
}

.btn {
    height: 40px;
    padding: 0 14px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    cursor: pointer;
    background: #fff;
}

.btn.primary {
    background: #111827;
    color: #fff;
    border-color: #111827;
}

.err {
    margin-top: 10px;
    color: #dc2626;
}

.muted {
    color: #6b7280;
    font-size: 13px;
}
</style>
