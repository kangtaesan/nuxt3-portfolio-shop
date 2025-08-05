<template>
    <div class="find-id">
        <!-- Step 1: 이메일 또는 휴대폰 인증번호 요청 -->
        <div v-if="step === 1">
            <h3>아이디 찾기</h3>

            <!-- 이메일 인증 -->
            <div class="input-group">
                <label>이메일 인증하기</label>
                <input v-model="email" type="email" placeholder="abc@abc.com" />
                <button @click="requestEmailCode">인증 요청</button>
            </div>

            <!-- 휴대폰 인증 -->
            <div class="input-group">
                <label>휴대폰 인증하기</label>
                <input v-model="phone" type="tel" placeholder="(-)를 빼고 작성해주세요." />
                <button @click="requestPhoneCode">인증 요청</button>
            </div>
        </div>

        <!-- Step 2: 인증번호 입력 -->
        <div v-else-if="step === 2">
            <h3>인증번호 확인</h3>
            <input v-model="code" type="text" placeholder="인증번호를 입력하세요" />
            <button @click="verifyCode">확인</button>
        </div>

        <!-- Step 3: 아이디 결과 표시 -->
        <div v-else-if="step === 3">
            <h3>아이디 찾기 결과</h3>
            <p>회원님의 아이디는 <strong style="color: darkblue;">{{ foundUsername }}</strong> 입니다.</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

const { requestFindId, verifyFindId } = useAuth()

const step = ref(1)
const email = ref('')
const phone = ref('')
const code = ref('')
const foundUsername = ref('')

// 이메일 인증 요청
const requestEmailCode = async () => {
    if (!email.value) return alert('이메일을 입력하세요.')
    await requestFindId({ email: email.value })
    alert('이메일 인증번호가 전송되었습니다.')
    step.value = 2
}

// 휴대폰 인증 요청
const requestPhoneCode = async () => {
    if (!phone.value) return alert('휴대폰 번호를 입력하세요.')
    await requestFindId({ phone: phone.value })
    alert('휴대폰 인증번호가 전송되었습니다.')
    step.value = 2
}

// 인증번호 확인
const verifyCode = async () => {
    const result = await verifyFindId({ contact: email.value || phone.value, code: code.value })
    if (result.statusCode === 200) {
        foundUsername.value = result.username
        step.value = 3
    } else {
        alert(result.message)
    }
}
</script>

<style scoped>
.input-group {
    margin-bottom: 1rem;
}
</style>