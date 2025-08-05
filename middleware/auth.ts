import { useAuthStore } from "~/store/auth";

export default defineNuxtRouteMiddleware((to) => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
        return navigateTo(`/login?redirect=${to.fullPath}`)
      }
})

// 보호할 페이지에서 middleware 적용 - 로그인 상태가 아니면 자동 리다이렉트
// 코드 추가시 해당 페이지 진입 전에 auth.ts 미들웨어 자동 실행

// definePageMeta({
//   middleware: 'auth'
// })