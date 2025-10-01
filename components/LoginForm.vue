<template>
    <div class="login">
        <div class="inner">
            <form @submit.prevent="handleLogin">
                <div class="username-wrapper">
                    <label for="username"></label>
                    <input id="username" v-model="username" type="text" placeholder="아이디" autocomplete="username">
                </div>
                <div class="password-wrapper">
                    <label for="password"></label>
                    <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
                        class="password-input" placeholder="비밀번호" autocomplete="current-password" />
                    <div>
                        <!-- 눈 아이콘 -->
                        <button type="button" class="toggle-btn" @click="togglePassword">
                            <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                        </button>
                    </div>
                </div>
                <button type="submit" class="login_btn">로그인</button>
            </form>
            <div class="links">
                <NuxtLink to="/signup">회원가입</NuxtLink>
                <span @click="openPopup('find-id')">아이디 찾기</span>
                <span @click="openPopup('reset-password')">비밀번호 찾기</span>
            </div>
            <FindResetPopup v-if="isPopupOpen" :initial-tab="popupTab" @close="isPopupOpen = false" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { useAuthStore } from '@/store/auth'
import { useApi } from '@/composables/useApi'
import FindResetPopup from '@/components/FindResetPopup.vue'


const username = ref('')
const password = ref('')
const { login } = useAuth()
const { get } = useApi()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const showPassword = ref(false)

const handleLogin = async () => {
    try {
        const { token } = await login(username.value, password.value)
        const { user } = await get('/api/auth/me')
        // 로그인 성공 시 store에 상태 저장
        authStore.setAuth(user, token)

        // redirect 파라미터가 있으면 그쪽으로 이동, 없으면 홈으로 이동
        const redirectPath = route.query.redirect || '/'
        await router.push(redirectPath as string)

        console.log('✅ 로그인 성공:', user)
    } catch (err: any) {
        console.error('❌ 로그인 실패:', err.message)
        alert('아이디 또는 비밀번호가 올바르지 않습니다.')
    }
}

const isPopupOpen = ref(false)
const popupTab = ref<'find-id' | 'reset-password'>('find-id')
const openPopup = (tab: 'find-id' | 'reset-password') => {
    popupTab.value = tab
    isPopupOpen.value = true
}

const togglePassword = () => {
    showPassword.value = !showPassword.value
}


onMounted(() => {
    try {
        const raw = sessionStorage.getItem('demoCreds')
        if (!raw) return
        const { id, pw } = JSON.parse(raw)

        username.value = id || ''
        password.value = pw || ''

        // 1회용 → 바로 제거
        sessionStorage.removeItem('demoCreds')

    } catch { }
})
</script>

<style scoped>
a {
    text-decoration: none;
    color: black;
}

.login {
    min-height: 78vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f7f8fa;
}

.login .inner {
    width: 100%;
    max-width: 420px;
    padding: 28px 28px 20px;
    background: #fff;
    border: 1px solid #eceff3;
    border-radius: 16px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, .06);
}

form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 0 auto;
    max-width: 420px;
}

.username-wrapper,
.password-wrapper {
    position: relative;
    width: 100%;
}

.username-wrapper input,
.password-input {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    font-size: 14px;
    background: #fff;
    outline: none;
    transition: border-color .15s ease, box-shadow .15s ease, background .2s ease;
    box-sizing: border-box;
}

.username-wrapper input:focus,
.password-input:focus {
    border-color: #c7d2fe;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, .16);
}

.toggle-btn {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: #6b7280;
    cursor: pointer;
    transition: background .15s ease, color .15s ease;
}

.toggle-btn:hover {
    background: #f3f4f6;
    color: #111827;
}

.login_btn {
    width: 100%;
    padding: 12px 16px;
    border: none;
    border-radius: 12px;
    background: #111827;
    color: #fff;
    font-weight: 700;
    letter-spacing: .1px;
    cursor: pointer;
    transition: opacity .15s ease, transform .05s ease, box-shadow .15s ease;
    box-shadow: 0 8px 18px rgba(0, 0, 0, .08);
}

.login_btn:hover {
    opacity: .95;
}

.login_btn:active {
    transform: translateY(1px);
}

.links {
    margin: 10px auto 0;
    display: flex;
    justify-content: center;
    gap: 12px;
    font-size: 14px;
    color: #374151;
}

.links a,
.links span {
    text-decoration: none;
    color: #374151;
    padding: 4px 6px;
    border-radius: 8px;
    transition: background .15s ease, color .15s ease;
    cursor: pointer;
}

.links a:hover,
.links span:hover {
    background: #f3f4f6;
    color: #111827;
}

@media (max-width: 480px) {
    .login .inner {
        padding: 22px 18px 16px;
        border-radius: 14px;
    }

    .toggle-btn {
        right: 6px;
    }
}
</style>