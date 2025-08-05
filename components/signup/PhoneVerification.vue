<template>
    <div>
        <label for="phone">Phone: </label>
        <input type="text" id="phone" v-model="phone" placeholder="01012345678">
        <button type="button" @click="sendCode" :disabled="codeSent">
            인증번호 전송
        </button>
    </div>
    <!-- 인증번호 입력 -->
    <div v-if="codeSent">
        <input type="text" v-model="verifiedCode" placeholder="휴대폰 인증번호 입력">
        <button type="button" @click="verifyCode">인증 확인</button>

        <!-- 인증 완료 메세지 -->
        <span v-if="isPhoneVerified" style="color: green;">인증 완료</span>
    </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth';

const { requestPhone, verifyPhone } = useAuth()

const phone = defineModel<string>('phone')
const isPhoneVerified = defineModel<boolean>('isPhoneVerified')
const codeSent = ref(false) // 인증번호 전송 여부
const verifiedCode = ref('') // 입력한 인증번호

// 인증번호 전송
const sendCode = async () => {
    if (!phone.value) {
        alert('휴대폰 번호를 입력해주세요.')
        return
    }

    const result = await requestPhone({ phone: phone.value })

    if (!result) {
        alert('인증번호 전송 실패')
        return
    }
    // 개발 단계에서 콘솔에 인증번호 출력
    if (result.data?.code) {
        console.log(`[DEV] 발급된 인증번호: ${result.data.code}`)
    }

    alert('인증번호가 전송되었습니다. (콘솔 확인)')
    codeSent.value = true
}

// 인증번호 검증
const verifyCode = async () => {
    if (!phone.value || !verifiedCode.value) {
        alert('번호와 인증번호를 모두 입력해주세요.')
        return
    }

    const result = await verifyPhone({ phone: phone.value, code: verifiedCode.value })

    if (!result) {
        alert('인증 실패')
        return
    }

    alert('휴대폰 인증 완료')
    isPhoneVerified.value = true
}

</script>

<style scoped></style>