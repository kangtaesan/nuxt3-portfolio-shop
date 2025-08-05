import { useAuthStore } from '@/store/auth'

export default defineNuxtPlugin((nuxtApp) => {
  const authStore = useAuthStore()

  // 미들웨어(auth.server.ts)에서 넣은 값 읽기
  const event = useRequestEvent()
  const authData = event?.context.auth

  if (authData?.user) {
    authStore.setAuth(authData.user, authData.token) // initialized true
  } else {
    authStore.logout() // initialized true
  }
  console.log('[PLUGIN] SSR authData:', authData)

})