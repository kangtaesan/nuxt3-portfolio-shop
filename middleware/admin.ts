import { useAuthStore } from '@/store/auth'

export default defineNuxtRouteMiddleware(() => {
    const auth = useAuthStore()

    if(!auth.isAuthenticated || auth.user?.role !== 'admin') {
        return navigateTo('/', {replace: true})
    }
})