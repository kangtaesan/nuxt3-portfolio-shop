<template>
    <div class="signup">
        <form @submit.prevent="handleSignup">
            <div>
                <label for="username">ID</label>
                <input id="username" type="text" v-model="username">
            </div>
            <div>
                <label for="password">PW</label>
                <input id="password" type="password" v-model="password" autocomplete="new-password">
            </div>
            <div>
                <label for="passwordConfirm">PW 확인</label>
                <input id="passwordConfirm" type="password" v-model="passwordConfirm" autocomplete="new-password">

            </div>
            <div>
                <label for="nickname">Nickname</label>
                <input id="nickname" type="text" v-model="nickname">
            </div>
            <EmailVerification v-model:emailId="emailId" v-model:emailDomain="emailDomain"
                v-model:customDomain="customDomain" v-model:emailVerificationSent="emailVerificationSent"
                v-model:isEmailVerified="isEmailVerified" v-model:verificationToken="verificationToken">
            </EmailVerification>

            <PhoneVerification v-model:phone="phone" v-model:isPhoneVerified="isPhoneVerified"></PhoneVerification>
            <button type="submit" :disabled="!isEmailVerified">회원가입</button>
            <p v-if="passwordConfirm && passwordConfirm !== password" class="error">
                비밀번호가 일치하지 않습니다.
            </p>
        </form>
    </div>

</template>

<script setup lang="ts">
import { navigateTo } from '#app'
import { useAuth } from '@/composables/useAuth'
import { onBeforeRouteLeave } from 'vue-router'
import EmailVerification from './signup/EmailVerification.vue'
import PhoneVerification from './signup/PhoneVerification.vue'

const { signup } = useAuth()

const username = ref('')
const password = ref('')
const passwordConfirm = ref('')
const nickname = ref('')

const emailId = ref('')
const emailDomain = ref('도메인 선택')
const customDomain = ref('')
const emailVerificationSent = ref(false)
const isEmailVerified = ref(false)
const verificationToken = ref('') // 토큰 저장용

const phone = ref('')
const isPhoneVerified = ref(false)

// 폼 값 자동 저장
watch([username, password, nickname, emailId, emailDomain, customDomain, phone], () => {
    const formData = {
        username: username.value,
        password: password.value,
        nickname: nickname.value,
        emailId: emailId.value,
        emailDomain: emailDomain.value,
        customDomain: customDomain.value,
        phone: phone.value,
    }
    localStorage.setItem('signupFormData', JSON.stringify(formData))
})

// 마운트 시 값 복원 + storage 이벤트 감지
onMounted(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const isReload = navigation && navigation.type === 'reload'

    if (isReload) {
        localStorage.removeItem('signupFormData') // 새로고침 시 초기화
    }

    // 기존 값 복원 로직
    const savedData = localStorage.getItem('signupFormData')
    if (savedData) {
        const formData = JSON.parse(savedData)
        username.value = formData.username || ''
        password.value = formData.password || ''
        nickname.value = formData.nickname || ''
        emailId.value = formData.emailId || ''
        emailDomain.value = formData.emailDomain || '도메인 선택'
        customDomain.value = formData.customDomain || ''
        phone.value = formData.phone || ''
    }

    // storage 이벤트 감지
    window.addEventListener('storage', (event) => {
        if (event.key === 'emailVerified' && event.newValue === 'true') {
            isEmailVerified.value = true
            alert('이메일 인증이 완료되었습니다.')
            localStorage.removeItem('emailVerified')
        }
    })
})
// 다른 페이지 이동 시 초기화
onBeforeRouteLeave(() => {
    localStorage.removeItem('signupFormData')
})

// 회원가입 처리 함수
const handleSignup = async () => {
    if (password.value !== passwordConfirm.value) {
        alert('비밀번호가 일치하지 않습니다.')
        return
    }

    try {
        // 기존 username 대신 token 전달
        const result = await signup(
            username.value,
            password.value,
            nickname.value,
            verificationToken.value,
        )
        alert('회원가입이 완료되었습니다!')
        // 가입 성공 시 초기화
        localStorage.removeItem('signupFormData')
        navigateTo('/login')
        console.log(result)
    } catch (error: unknown) {
        const { response } = error as {
            response?: {
                status?: number
                statusMessage?: string
                body?: { message?: string }
            }
        }
        if (response?.status === 409) {
            alert('이미 존재하는 아이디입니다.') // ID
        } else if (response?.status === 410) {
            alert('이미 존재하는 닉네임입니다.') // NICKNAME
        } else if (response?.status === 411) {
            alert('이미 사용된 이메일입니다.') // EMAIL
        } else if (response?.status === 422) {
            alert('비밀번호는 8자 이상이며 특수문자를 포함해야 합니다.') // PW
        } else {
            alert('회원가입 실패')
        }
    }
}

</script>

<style scoped>
.signup {
    min-height: 78vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f7f8fa;
}

.signup form {
    width: 100%;
    max-width: 560px;
    padding: 28px 28px 22px;
    background: #fff;
    border: 1px solid #eceff3;
    border-radius: 16px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, .06);
}

.signup form>div {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.signup label {
    width: 100px;
    font-size: 14px;
    color: #6b7280;
    text-align: left;
}

.signup input,
.signup select {
    flex: 1 1 auto;
    padding: 12px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #fff;
    font-size: 14px;
    outline: none;
    transition: border-color .15s ease, box-shadow .15s ease, background .2s ease;
    box-sizing: border-box;
}

.signup input:focus,
.signup select:focus {
    border-color: #c7d2fe;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, .16);
}

.signup button {
    height: 38px;
    padding: 0 12px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #fff;
    color: #111827;
    font-weight: 600;
    cursor: pointer;
    transition: background .15s ease, border-color .15s ease, color .15s ease, opacity .15s ease;
}

.signup button:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
}

.signup button[type="submit"] {
    width: 100%;
    height: auto;
    padding: 12px 16px;
    margin-top: 8px;
    border: none;
    border-radius: 12px;
    background: #111827;
    color: #fff;
    box-shadow: 0 8px 18px rgba(0, 0, 0, .08);
}

.signup button[type="submit"]:hover {
    opacity: .95;
}

.signup button[type="submit"]:active {
    transform: translateY(1px);
}

.signup button[type="submit"][disabled] {
    background: #f3f4f6 !important;
    color: #9aa3af !important;
    box-shadow: none;
    cursor: not-allowed;
}

.signup span {
    display: block;
    margin: 2px 0 8px 120px;
    color: #6b7280;
    font-size: 13px;
}

.error {
    margin-top: 8px;
    color: #ef4444;
    font-size: 13px;
}

@media (max-width: 520px) {
    .signup form {
        padding: 22px 18px 18px;
    }

    .signup form>div {
        flex-direction: column;
        align-items: stretch;
    }

    .signup label {
        width: 100%;
        text-align: left;
    }

    .signup span {
        margin-left: 0;
    }
}
</style>