<template>
    <div class="verification-result">
        <p v-if="status === 'loading'">인증 중입니다...</p>
        <p v-else-if="status === 'success'" style="color: green;">인증이 완료되었습니다. 창을 닫아주세요.</p>
        <p v-else-if="status === 'fail'" style="color: red;">인증에 실패했습니다. 다시 시도해주세요.</p>
    </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useApi } from '@/composables/useApi'

definePageMeta({
    layout: 'blank'
})

const { get } = useApi()
const route = useRoute()
const status = ref<'loading' | 'success' | 'fail'>('loading')

onMounted(async () => {
    const token = route.query.token as string | undefined
    if (!token) {
        status.value = 'fail'
        return
    }

    try {
        const result = await get(`/api/auth/signup/email-verify?token=${token}`)
        if (result.statusCode === 200) {
            localStorage.setItem('emailVerified', 'true')
            status.value = 'success'
            setTimeout(() => window.close(), 3000) // 3초 후 자동 닫기
        } else {
            status.value = 'fail'
        }
    } catch {
        status.value = 'fail'
    }
})
</script>

<style scoped>
.verification-result {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 1.2rem;
    font-weight: bold;
}
</style>