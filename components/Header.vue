<template>
    <header class="header">
        <nav class="wrapper">
            <NuxtLink to="/" class="logo">Portfolio</NuxtLink>
            <!-- <NuxtLink to="/products">상품</NuxtLink> -->
            <!-- 초기화 완료 후 렌더링 -->
            <div class="wrapper-links" v-if="initialized">
                <!-- <NuxtLink to="/mypage">마이 페이지</NuxtLink> -->
                <NuxtLink :to="loginLink" v-if="!isAuthenticated">
                    로그인
                </NuxtLink>
                <button v-else @click="handleLogout">로그아웃</button>
            </div>
        </nav>
    </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/auth'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const authStore = useAuthStore()
const { isAuthenticated, initialized } = storeToRefs(authStore) // 반응형으로 isAuthenticated 추적
const { logout } = authStore // 호출 시 로그인 상태 초기화

const loginLink = computed(() => ({
    path: '/login',
    query: { redirect: route.fullPath }
}))

const handleLogout = async () => {
    await logout()
    router.push('/') // 로그아웃 후 홈으로 이동
}

</script>

<style scoped>
.header {
    background-color: #f5f5f5;
    padding: 16px 32px;
    border-bottom: 1px solid #ddd;
}

.wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-weight: bold;
    font-size: 20px;
    text-decoration: none;
    color: #333;
}

.wrapper-links {
    display: flex;
    gap: 16px;
}

.wrapper-links a,
.wrapper-links button {
    text-decoration: none;
    color: #333;
    background: none;
    border: none;
    cursor: pointer;
    font: inherit;
}
</style>