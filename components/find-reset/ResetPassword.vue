<template>
    <div class="reset-password">
        <!-- Step 1: 아이디 확인 -->
        <div v-if="step === 1">
            <h3>아이디 입력</h3>
            <input v-model="username" type="text" placeholder="아이디를 입력하세요" />
            <button @click="checkUsername">다음</button>
        </div>

        <!-- Step 2: 이메일 또는 휴대폰 인증번호 요청 -->
        <div v-else-if="step === 2">
            <h3>인증 방법 선택</h3>

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

        <!-- Step 3: 인증번호 입력 -->
        <div v-else-if="step === 3">
            <h3>인증번호 확인</h3>
            <input v-model="code" type="text" placeholder="인증번호를 입력하세요" />
            <button @click="verifyCode">확인</button>
        </div>

        <!-- Step 4: 새 비밀번호 설정 -->
        <div v-else-if="step === 4">
            <h3>새 비밀번호 설정</h3>
            <input v-model="newPassword" type="password" placeholder="새 비밀번호" />
            <input v-model="confirmPassword" type="password" placeholder="새 비밀번호 확인" />
            <button @click="updatePassword">비밀번호 변경</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

const { checkUserExist, requestResetPassword, verifyResetPassword } = useAuth()

const step = ref(1)
const username = ref('')
const email = ref('')
const phone = ref('')
const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// Step1: 아이디 확인
const checkUsername = async () => {
    if (!username.value) return alert('아이디를 입력하세요.')
    const result = await checkUserExist({ username: username.value })
    if (result.statusCode === 200) {
        step.value = 2
    } else {
        alert(result.message)
    }
}

// Step2: 이메일 인증 요청
const requestEmailCode = async () => {
    if (!email.value) return alert('이메일을 입력하세요.')
    await requestResetPassword({ username: username.value, email: email.value })
    alert('이메일 인증번호가 전송되었습니다.')
    step.value = 3
}

// Step2: 휴대폰 인증 요청
const requestPhoneCode = async () => {
    if (!phone.value) return alert('휴대폰 번호를 입력하세요.')
    await requestResetPassword({ username: username.value, phone: phone.value })
    alert('휴대폰 인증번호가 전송되었습니다.')
    step.value = 3
}

// Step3: 인증번호 확인
const verifyCode = async () => {
    const result = await verifyResetPassword({ username: username.value, code: code.value })
    if (result.statusCode === 200) {
        alert('인증 완료')
        step.value = 4
    } else {
        alert(result.message)
    }
}

// Step4: 비밀번호 변경
const updatePassword = async () => {
    if (newPassword.value !== confirmPassword.value) {
        return alert('비밀번호가 일치하지 않습니다.')
    }
    const result = await verifyResetPassword({
        username: username.value,
        code: code.value,
        newPassword: newPassword.value
    })
    if (result.statusCode === 200) {
        alert('비밀번호가 성공적으로 변경되었습니다.')
        step.value = 1
        username.value = ''
        email.value = ''
        phone.value = ''
        code.value = ''
        newPassword.value = ''
        confirmPassword.value = ''
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