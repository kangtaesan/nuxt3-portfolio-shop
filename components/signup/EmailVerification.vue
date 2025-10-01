<template>
    <div>
        <label for="email">Email</label>
        <input id="email" type="text" v-model="emailId" autocomplete="email"> @
        <select v-model="emailDomain" v-if="!isCustomDomain">
            <option value="도메인 선택">도메인 선택</option>
            <option value="gmail.com">gmail.com</option>
            <option value="naver.com">naver.com</option>
            <option value="daum.net">daum.net</option>
            <option value="custom">직접 입력</option>
        </select>
        <input v-if="isCustomDomain" v-model="customDomain" />
    </div>
    <div class="verification">
        <button type="button" @click="sendEmailVerification"
            :disabled="isEmailVerified || (emailVerificationSent && !isEmailVerified)"
            :class="{ success: isEmailVerified }">
            {{ emailBtnText }}
        </button>
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

const emailBtnText = computed(() => {
    if (isEmailVerified.value) return '이메일 인증완료'
    if (emailVerificationSent.value) return '인증 메일 전송됨'
    return '이메일 인증하기'
})

</script>

<style scoped>
/* 컴포넌트 루트 컨테이너 */
div {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 10px;
}



/* 라벨 */
label {
    width: 100px;
    font-size: 14px;
    color: #6b7280;
    margin-right: 4px;
}

/* 아이디 입력칸 */
#email {
    flex: 1 1 auto;
    padding: 10px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #fff;
    font-size: 14px;
    outline: none;
    transition: border-color .15s ease, box-shadow .15s ease;
}

#email:focus {
    border-color: #c7d2fe;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, .16);
}

/* @ 구분자 */
div> :where(span, i) {
    color: #6b7280;
}

/* 도메인 셀렉트 */
select {
    flex: 1 1 auto;
    min-width: 200px;
    height: 40px;
    padding: 0 12px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #fff;
    font-size: 14px;
    outline: none;
    transition: border-color .15s ease, box-shadow .15s ease;
}

select:focus {
    border-color: #c7d2fe;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, .16);
}


input:not(#email) {
    height: 40px;
    padding: 0 12px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #fff;
    font-size: 14px;
    outline: none;
    transition: border-color .15s ease, box-shadow .15s ease;
}

input:not(#email):focus {
    border-color: #c7d2fe;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, .16);
}

.verification {
    display: flex;
    justify-content: right;
    margin-top: 8px;
}

/* 인증 버튼 */
.verification button {
    min-width: 120px;
    height: 40px;
    padding: 0 14px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #111827;
    color: #fff;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 6px 16px rgba(0, 0, 0, .08);
    transition: opacity .15s ease, transform .05s ease, background .15s ease, border-color .15s ease;
}

.verification button:hover {
    opacity: .95;
}

.verification button:active {
    transform: translateY(1px);
}

/* 비활성화(전송 후) */
.verification button:disabled {
    background: #f3f4f6;
    color: #9aa3af;
    border-color: #e5e7eb;
    cursor: not-allowed;
    box-shadow: none;
}

/* 인증 완료 배지 */
.verification span[style*="green"] {
    margin-left: 6px;
    padding: 6px 10px;
    border-radius: 999px;
    background: #e6fbe8;
    color: #177245 !important;
    font-weight: 700;
    border: 1px solid #c7f1cc;
}

/* 반응형: 좁은 화면에서 줄바꿈/풀폭 */
@media (max-width: 560px) {
    div {
        gap: 10px;
    }

    #email {
        flex-basis: 100%;
    }

    select,
    input:not(#email) {
        flex: 1 1 140px;
    }

    button {
        width: 100%;
    }
}
</style>