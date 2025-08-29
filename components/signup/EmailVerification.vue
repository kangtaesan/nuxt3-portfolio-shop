<template>
    <div>
        <label for="email">Email: </label>
        <input id="email" type="text" v-model="emailId"> @
        <select v-model="emailDomain">
            <option value="도메인 선택">도메인 선택</option>
            <option value="gmail.com">gmail.com</option>
            <option value="naver.com">naver.com</option>
            <option value="daum.net">daum.net</option>
            <option value="custom">직접 입력</option>
        </select>
        <input v-if="isCustomDomain" v-model="customDomain" />
        <button type="button" @click="sendEmailVerification" :disabled="emailVerificationSent">
            이메일 인증하기
        </button>
        <span v-if="isEmailVerified" style="color: green;">인증 완료</span>
    </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
const { requestEmail } = useAuth()

const emailId = defineModel<string>('emailId')
const emailDomain = defineModel<string>('emailDomain')
const customDomain = defineModel<string>('customDomain')
const isCustomDomain = computed(() => emailDomain.value === 'custom')
// 상태 관리
const emailVerificationSent = defineModel<boolean>('emailVerificationSent')
const isEmailVerified = defineModel<boolean>('isEmailVerified')
const verificationToken = defineModel<string>('verificationToken')

// 인증 메일 발송
const sendEmailVerification = async () => {
    if (!emailId.value) {
        alert('이메일 아이디를 입력하세요.')
        return
    }
    // 최종 이메일 문자열로 조합
    const fullEmail = isCustomDomain.value
        ? `${emailId.value}@${customDomain.value}`
        : `${emailId.value}@${emailDomain.value}`
    // API 호출
    const { data, error } = await requestEmail({ email: fullEmail })
    console.log('API 응답:', data, error)

    if (error) {
        alert(error.message || '이메일 인증 요청 실패')
        return
    }
    const res = data?.value ?? data // (혹시 $fetch로 바뀌어도 안전)
    if (!res?.token) {
        alert('토큰 응답이 없습니다.')
        return
    }

    // 토큰 저장
    verificationToken.value = res.token
    emailVerificationSent.value = true
    isEmailVerified.value = false
    alert(data.message || '인증 메일이 전송되었습니다.')
}

</script>

<style lang="scss" scoped></style>