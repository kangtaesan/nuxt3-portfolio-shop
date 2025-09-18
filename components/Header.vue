<template>
    <header class="header">
        <nav class="wrapper">
            <NuxtLink to="/" class="logo">Portfolio</NuxtLink>
            <NuxtLink to="/products" class="products">상품</NuxtLink>
            <!-- 초기화 완료 후 렌더링 -->
            <div class="wrapper-links" v-if="initialized">
                <button class="icon-btn" type="button" @click="toggleSearch"
                    :aria-expanded="showSearch ? 'true' : 'false'" aria-controls="header-search" title="검색 열기/닫기">
                    <span aria-hidden="true"><i class="fa-solid fa-magnifying-glass"></i></span>
                </button>
                <NuxtLink to="/cart"><i class="fa-solid fa-cart-shopping"></i></NuxtLink>
                <NuxtLink v-if="isAdmin" to="/admin"><i class="fa-solid fa-user-tie"></i></NuxtLink>
                <NuxtLink to="/mypage"><i class="fa-solid fa-user"></i></NuxtLink>
                <NuxtLink :to="loginLink" v-if="!isAuthenticated">
                    Login
                </NuxtLink>
                <button v-else @click="handleLogout">Logout</button>
            </div>
        </nav>
        <!-- ▼ 검색 패널: 헤더 아래로 슬라이드 다운 -->
        <transition name="search-slide">
            <div v-show="showSearch" ref="panelRef" class="search-panel">
                <form class="search" id="header-search" @submit.prevent="goSearch">
                    <input v-model.trim="kw" type="search" placeholder="상품 검색..." aria-label="상품 검색" />
                    <button type="submit">검색</button>
                </form>
            </div>
        </transition>
    </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/auth'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const authStore = useAuthStore()
const { isAuthenticated, isAdmin, initialized } = storeToRefs(authStore) // 반응형으로 isAuthenticated 추적
const { logout } = authStore // 호출 시 로그인 상태 초기화

// URL에 q가 이미 있으면 인풋에 보여주기(공유/새로고침 대응)
const kw = ref<string>((route.query.q as string) || '')

/* 토글 상태 + 외부 클릭 닫기 */
const showSearch = ref(false)
const panelRef = ref<HTMLElement | null>(null)

function toggleSearch() {
    showSearch.value = !showSearch.value
    if (showSearch.value) {
        // 열리면서 포커스
        requestAnimationFrame(() => {
            const el = panelRef.value?.querySelector('input') as HTMLInputElement | null
            el?.focus()
        })
    }
}

function closeSearch() { showSearch.value = false }

/* 라우트 바뀌면 자동 닫기 */
watch(() => route.fullPath, () => closeSearch())

/* ESC 로 닫기 */
onMounted(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSearch() }
    document.addEventListener('keydown', onKey)
    onUnmounted(() => document.removeEventListener('keydown', onKey))
})

/* 바깥 클릭 시 닫기 */
onMounted(() => {
    const onClick = (e: MouseEvent) => {
        if (!showSearch.value) return
        const t = e.target as Node
        if (panelRef.value && !panelRef.value.contains(t)) {
            // 아이콘 버튼(토글)도 제외
            const btn = (e.target as HTMLElement).closest('.icon-btn')
            if (!btn) closeSearch()
        }
    }
    document.addEventListener('click', onClick)
    onUnmounted(() => document.removeEventListener('click', onClick))
})

function goSearch() {
    router.push({
        path: '/products',
        query: { q: kw.value || undefined, page: '1' },
    })
}

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
    background-color: #fff;
    padding: 16px 32px;
    border-bottom: 1px solid #ddd;
    position: fixed;
    top: 0;
    left: 50%;
    transform: translate(-50%);
    width: 95%;
    z-index: 10;
}

.wrapper {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 12px;
}

.logo {
    font-weight: bold;
    font-size: 20px;
    text-decoration: none;
    color: #333;
}

.products {
    text-decoration: none;
    color: #333;
    justify-self: center;
}

.wrapper-links {
    display: inline-flex;
    align-items: center;
    gap: 16px;
}

.wrapper-links a,
.wrapper-links button {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    color: #333;
    background: none;
    border: 0;
    padding: 0;
    line-height: 1;
    cursor: pointer;
    font: inherit;
}

/* 아이콘 버튼 공통(기존 스타일과 섞어 사용) */
.icon-btn {
    background: transparent;
    border: 0;
    padding: 6px;
    cursor: pointer;
    font-size: 18px;
    line-height: 0;
}

/* 패널 컨테이너 */
.search-panel {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    top: 60px;
    width: 100%;
    background: #fff;
    border-top: 1px solid #eee;
    box-shadow: 0 6px 18px rgba(0, 0, 0, .06);
    padding: 12px 16px;
    z-index: 999;
    overflow: hidden;
    transform-origin: top center;
}

.search {
    display: flex;
    gap: 8px;
    max-width: 720px;
    margin: 0 auto;
}

.search input {
    flex: 1;
    height: 40px;
    padding: 0 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
}

.search button {
    height: 40px;
    padding: 0 14px;
    border-radius: 8px;
    border: 1px solid #111827;
    background: #111827;
    color: #fff;
    cursor: pointer;
}

/* 슬라이드 애니메이션 */
.search-slide-enter-active,
.search-slide-leave-active {
    transition: max-height .22s ease, opacity .22s ease;
}

.search-slide-enter-from,
.search-slide-leave-to {
    max-height: 0;
    opacity: 0;
}

.search-slide-enter-to,
.search-slide-leave-from {
    max-height: 160px;
    opacity: 1;
}
</style>