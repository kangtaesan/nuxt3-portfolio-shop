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

</script>

<style scoped>
a {
    text-decoration: none;
    color: black;
}

form {
    max-width: 500px;
    margin: auto;
}

.login {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 90vh;
    background-color: #f9f9f9;
}

.links {
    margin: 10px auto 0;
    display: flex;
    justify-content: center;
    gap: 8px;
    max-width: 500px;
}

.links span {
    cursor: pointer;
}

.username-wrapper {
    width: 100%;
}

.username-wrapper input {
    width: 100%;
    box-sizing: border-box;
}

.password-wrapper {
    position: relative;
    width: 100%;
    display: flex;
}

.password-input {
    width: 100%;
    box-sizing: border-box;
}

.toggle-btn {
    position: absolute;
    right: 1%;
    top: 50%;
    transform: translateY(-55%);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.8rem;
    color: #555;
}

.login_btn {
    width: 100%;
    margin-top: 5%;
}
</style>