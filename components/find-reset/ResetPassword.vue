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
.reset-password {
    width: 100%;
    max-width: 560px;
    margin: 0 auto;
    padding: 0;
    background: transparent;
    border: none;
    box-shadow: none;
}

.reset-password *,
.reset-password *::before,
.reset-password *::after {
    box-sizing: border-box;
}

.reset-password>div {
    margin: 0 0 18px;
}

.reset-password h3 {
    margin: 0 0 14px;
    font-size: 18px;
    line-height: 1.35;
    font-weight: 600;
    color: #0f172a;
}

.reset-password input[type="text"],
.reset-password input[type="email"],
.reset-password input[type="tel"],
.reset-password input[type="password"] {
    width: 100%;
    height: 40px;
    padding: 0 14px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #f8fafc;
    font-size: 15px;
    color: #0f172a;
    outline: none;
    transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
}

.reset-password input::placeholder {
    color: #9ca3af;
}

.reset-password input:focus {
    background: #fff;
    border-color: #111827;
    box-shadow: 0 0 0 3px rgba(17, 24, 39, .08);
}

.reset-password button {
    height: 40px;
    padding: 0 14px;
    border: 1px solid #111827;
    border-radius: 12px;
    background: #111827;
    color: #fff;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: transform .05s ease, background .15s ease, color .15s ease;
}

.reset-password button:hover {
    background: #0b0f1a;
}

.reset-password button:active {
    transform: translateY(1px);
}

.reset-password button:disabled {
    opacity: .55;
    cursor: not-allowed;
}

.reset-password .input-group {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 10px 0;
    width: 100%;
}

.reset-password .input-group>label {
    flex: 0 0 130px;
    font-size: 14px;
    color: #475569;
}

.reset-password .input-group>input {
    flex: 1 1 auto;
    min-width: 0;
}

.reset-password .input-group>button {
    flex: 0 0 auto;
}

.reset-password>div>input+button {
    margin-top: 10px;
    width: 100%;
}

.reset-password>div input+input {
    margin-top: 10px;
}

.reset-password>div input+input+button {
    margin-top: 12px;
    width: 100%;
}

@media (max-width: 520px) {
    .reset-password .input-group {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
    }

    .reset-password .input-group>label {
        flex: none;
    }

    .reset-password .input-group>button {
        width: 100%;
    }
}
</style>
