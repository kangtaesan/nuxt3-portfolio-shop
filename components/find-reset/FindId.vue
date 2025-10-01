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
.find-id {
    width: 100%;
    max-width: 560px;
    margin: 0 auto;
    padding: 0;
    background: transparent;
    box-shadow: none;
    border: none;
}

.find-id h3 {
    margin: 0 0 14px;
    font-size: 18px;
    line-height: 1.35;
    font-weight: 600;
    color: #0f172a;
}

.find-id>div+div {
    margin-top: 10px;
}

.input-group {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 10px 0;
}

.input-group>label {
    flex: 0 0 130px;
    font-size: 14px;
    color: #475569;
}

.input-group>input,
.find-id input[type="text"],
.find-id input[type="email"],
.find-id input[type="tel"] {
    flex: 1 1 auto;
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

.input-group>input::placeholder {
    color: #9ca3af;
}

.input-group>input:focus {
    background: #fff;
    border-color: #111827;
    box-shadow: 0 0 0 3px rgba(17, 24, 39, .08);
}

.find-id button {
    flex: 0 0 auto;
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

.find-id button:hover {
    background: #0b0f1a;
}

.find-id button:active {
    transform: translateY(1px);
}

.find-id button:disabled {
    opacity: .55;
    cursor: not-allowed;
}

@media (max-width: 520px) {
    .input-group {
        flex-direction: column;
        align-items: stretch;
    }

    .input-group>label {
        flex: none;
    }

    .find-id button {
        width: 100%;
    }
}
</style>
