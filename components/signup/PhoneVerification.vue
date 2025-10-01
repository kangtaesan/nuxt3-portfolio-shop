<template>
    <div class="phone">
        <label for="phone">Phone (선택)</label>
        <input type="text" id="phone" v-model="phone" placeholder="01012345678">
        <button type="button" @click="sendCode" :disabled="codeSent">
            인증번호 전송
        </button>
    </div>
    <!-- 인증번호 입력 -->
    <div v-if="codeSent" class="code">
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

<style scoped>
/* ===== Phone row ===== */
.phone {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
}

.phone label {
    width: 100px;
    /* 라벨 정렬 고정 */
    color: #6b7280;
    font-size: 14px;
}

/* 번호 입력 */
.phone input#phone {
    flex: 1 1 240px;
    min-width: 220px;
    height: 40px;
    padding: 0 12px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #fff;
    font-size: 14px;
    outline: none;
    transition: border-color .15s, box-shadow .15s;
}

.phone input#phone:focus {
    border-color: #c7d2fe;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, .16);
}

/* 전송 버튼 */
.phone button {
    min-width: 120px;
    height: 40px;
    padding: 0 12px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #111827;
    color: #fff;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 6px 16px rgba(0, 0, 0, .08);
    transition: opacity .15s, transform .05s;
}

.phone button:hover:not(:disabled) {
    opacity: .95;
}

.phone button:active:not(:disabled) {
    transform: translateY(1px);
}

.phone button:disabled {
    background: #f3f4f6;
    color: #9aa3af;
    border-color: #e5e7eb;
    cursor: not-allowed;
    box-shadow: none;
}

/* ===== Code row (인증번호 입력 + 확인) ===== */
.code {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
}

/* ✅ 인증번호 인풋 스타일링 */
.code input {
    flex: 1 1 260px;
    min-width: 220px;
    height: 40px;
    padding: 0 12px;
    margin-left: 108px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #fff;
    font-size: 14px;
    outline: none;
    transition: border-color .15s, box-shadow .15s;
}

.code input:focus {
    border-color: #c7d2fe;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, .16);
}

/* 인증 확인 버튼 */
.code button {
    min-width: 120px;
    height: 40px;
    padding: 0 12px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #111827;
    color: #fff;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 6px 16px rgba(0, 0, 0, .08);
    transition: opacity .15s, transform .05s;
}

.code button:hover {
    opacity: .95;
}

.code button:active {
    transform: translateY(1px);
}

/* 인증 완료 배지 */
.code span {
    padding: 6px 10px;
    border-radius: 999px;
    background: #e6fbe8;
    color: #177245;
    font-weight: 700;
    border: 1px solid #c7f1cc;
}

/* ===== Responsive ===== */
@media (max-width:560px) {
    .phone label {
        width: 100%;
        text-align: left;
    }

    .phone input#phone {
        flex-basis: 100%;
    }

    .phone button {
        width: 100%;
    }

    .code input {
        flex-basis: 100%;
    }

    .code button {
        width: 100%;
    }
}
</style>