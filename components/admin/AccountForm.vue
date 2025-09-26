<template>
    <section class="acc-info">
        <h2>사이트 기본 정보</h2>

        <form class="grid" @submit.prevent="save">
            <label class="lbl">사이트명</label>
            <input class="inp" v-model.trim="form.siteName" type="text">

            <label class="lbl">대표자</label>
            <input class="inp" v-model.trim="form.ceo" type="text">

            <label class="lbl">사업자등록번호</label>
            <input class="inp" v-model.trim="form.bizNo" type="text" placeholder="000-00-00000">

            <label class="lbl">통신판매업</label>
            <input class="inp" v-model.trim="form.mailOrderNo" type="text" placeholder="제2025-서울-0000호" />

            <label class="lbl">주소</label>
            <input class="inp" v-model.trim="form.address" type="text" />

            <label class="lbl">전화</label>
            <input class="inp" v-model.trim="form.tel" type="tel" placeholder="02-0000-0000" />

            <label class="lbl">이메일</label>
            <input class="inp" v-model.trim="form.email" type="email" placeholder="info@example.com" />

            <label class="lbl">개인정보관리책임자</label>
            <input class="inp" v-model.trim="form.cpo" type="text" />
        </form>

        <div class="actions">
            <button class="btn primary" :disabled="saving" @click="save">저장</button>
        </div>

        <p v-if="msg" class="msg">{{ msg }}</p>
        <p v-if="err" class="err">{{ err }}</p>

    </section>
</template>

<script setup lang="ts">
import type { SiteSettings } from '@/types/settings';

const empty: SiteSettings = {
    siteName: '',
    ceo: '',
    bizNo: '',
    mailOrderNo: '',
    address: '',
    tel: '',
    email: '',
    cpo: ''
}

const form = ref<SiteSettings>({ ...empty })
const saving = ref(false)
const msg = ref('')
const err = ref('')

const API = '/api/settings/site' as const

/* 불러오기 */
const { data, refresh } = await useAsyncData<SiteSettings>('site-settings-admin', () =>
    $fetch<SiteSettings>(API)
)

watchEffect(() => Object.assign(form.value, (data.value ?? empty)))

/* 저장 */
async function save() {
    msg.value = ''
    err.value = ''
    saving.value = true

    try {
        await $fetch(API, {
            method: 'PUT',
            body: { ...form.value }
        })
        msg.value = '저장되었습니다.'
        await refreshNuxtData(['site-settings', 'site-settings-admin'])
        await refresh()
    } catch (error: any) {
        err.value = error?.data?.message || '저장 실패'
    } finally {
        saving.value = false
    }
}
</script>

<style scoped>
.acc-info {
    padding: 16px;
}

.h2 {
    font-size: 18px;
    font-weight: 800;
    margin: 0 0 10px;
}

.grid {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 10px 12px;
    align-items: center;
}

.lbl {
    color: #6b7280;
}

.inp {
    height: 40px;
    padding: 0 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
}

.actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
}

.btn {
    height: 40px;
    padding: 0 14px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    cursor: pointer;
}

.btn.primary {
    background: #111827;
    color: #fff;
    border-color: #111827;
}

.msg {
    color: #047857;
    margin-top: 6px;
}

.err {
    color: #dc2626;
    margin-top: 6px;
}
</style>