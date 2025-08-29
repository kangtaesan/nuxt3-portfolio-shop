<template>
    <div class="signup">
        <form @submit.prevent="handleSignup">
            <div>
                <label for="username">ID: </label>
                <input id="username" type="text" v-model="username">
            </div>
            <div>
                <label for="password">PW: </label>
                <input id="password" type="password" v-model="password">
            </div>
            <div>
                <label for="passwordConfirm">PW확인: </label>
                <input id="passwordConfirm" type="password" v-model="passwordConfirm">

            </div>
            <div>
                <label for="nickname">Nickname: </label>
                <input id="nickname" type="text" v-model="nickname">
            </div>
            <EmailVerification v-model:emailId="emailId" v-model:emailDomain="emailDomain"
                v-model:customDomain="customDomain" v-model:emailVerificationSent="emailVerificationSent"
                v-model:isEmailVerified="isEmailVerified" v-model:verificationToken="verificationToken">
            </EmailVerification>

            <span>(선택사항)</span>
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
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 90vh;
    background-color: #f9f9f9;
}

form {
    max-width: 500px;
    margin: auto;
}

.error {
    color: red;
    font-size: 14px;
}
</style>