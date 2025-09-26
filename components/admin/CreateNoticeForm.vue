<template>
    <section class="notice-form">
        <h2 class="h2">{{ isEdit ? '공지 수정' : '공지 작성' }}</h2>

        <form class="grid" @submit.prevent="onSubmit">
            <label class="lbl">제목</label>
            <input class="inp" v-model.trim="form.title" placeholder="제목을 입력하세요" required />

            <label class="lbl">내용</label>
            <textarea class="ta" v-model.trim="form.message" rows="8" placeholder="공지 내용을 입력하세요" required />

            <label class="lbl">노출</label>
            <div class="row">
                <input id="enabled" type="checkbox" v-model="form.enabled" />
                <label for="enabled">사용</label>
            </div>
        </form>

        <div class="actions">
            <button class="btn" type="button" @click="goBack" :disabled="saving">취소</button>
            <button class="btn primary" type="button" @click="onSubmit" :disabled="saving">
                {{ isEdit ? '수정 저장' : '등록' }}
            </button>
        </div>

        <p v-if="err" class="err">{{ err }}</p>
    </section>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const editId = computed(() => String(route.query.id ?? '').trim())
const isEdit = computed(() => !!editId.value)

const form = reactive({ title: '', message: '', enabled: true })
const saving = ref(false)
const err = ref('')

onMounted(loadIfEdit)

async function loadIfEdit() {
    if (!isEdit.value) return
    err.value = ''
    try {
        const doc: any = await $fetch(`/api/cs/notice/${editId.value}`)
        form.title = doc?.title ?? ''
        form.message = doc?.message ?? ''
        form.enabled = Boolean(doc?.enabled ?? true)
    } catch (e: any) {
        err.value = e?.data?.message || '공지 로드 실패'
    }
}

function validate() {
    if (!form.title.trim()) return '제목을 입력하세요.'
    if (!form.message.trim()) return '내용을 입력하세요.'
    return ''
}

async function onSubmit() {
    const v = validate()
    if (v) { alert(v); return }

    saving.value = true
    err.value = ''
    try {
        if (isEdit.value) {
            await $fetch(`/api/cs/notice/${editId.value}`, { method: 'PATCH', body: form })
            alert('수정되었습니다.')
        } else {
            await $fetch('/api/cs/notice/create', { method: 'POST', body: form })
            alert('등록되었습니다.')
        }
        router.push('/admin/cs')
    } catch (e: any) {
        err.value = e?.data?.message || (isEdit.value ? '수정 실패' : '등록 실패')
    } finally {
        saving.value = false
    }
}

function goBack() { router.push('/admin/cs') }
</script>

<style scoped>
.notice-form {
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
    grid-template-columns: 140px 1fr;
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
.ta {
    border: 1px solid #e5e7eb;
    background: #fff;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
}

.ta {
    min-height: 180px;
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
}

.btn {
    height: 40px;
    padding: 0 14px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: #fff;
    cursor: pointer;
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
</style>
