// composables/useAuth.ts
import { useApi } from './useApi'
import { useAuthStore } from '@/store/auth'

// useFetch 사용 시 ref()로 감싸진 반응형 객체 출력, .value로 진짜 데이터 접근 
export const useAuth = () => {
    const authStore = useAuthStore()
    const { post } = useApi()

    const signup = async (username: string, password: string, nickname: string, token: string) => {
      return await post('/api/auth/signup', { username, password, nickname, token})
    }
    const login = async (username: string, password: string) => {
      return await post('/api/auth/login', { username, password }) // { token, user }
    }
    const requestEmail = async (payload: { email: string }) => {
      return await post('/api/auth/signup/email-request', payload)
    }
    const requestPhone = async (payload: { phone: string }) => {
      return await post('/api/auth/signup/phone-request', payload)
    }
    const verifyPhone = async (payload: { phone: string; code: string }) => {
      return await post('/api/auth/signup/phone-verify', payload)
    }
    const requestFindId = async (payload: { email?: string; phone?: string }) => {
      return await post('/api/auth/find-id/id-request', payload)
    }
    const verifyFindId = async (payload: { contact:string; code: string }) => {
      return await post('/api/auth/find-id/id-verify', payload)
    }
    const requestResetPassword = async (payload: { username: string; email?: string; phone?: string}) => {
      return await post('/api/auth/reset-password/password-request', payload)
    }
    const verifyResetPassword = async (payload: { username: string; code: string; newPassword?: string }) => {
      return await post('/api/auth/reset-password/password-verify', payload)
    }
    const checkUserExist = async (payload: { username: string }) => {
      return await post('/api/auth/reset-password/check-user', payload)
    }
    
    return {
      signup,
      login,
      requestEmail,
      requestPhone,
      verifyPhone,
      requestFindId,
      verifyFindId,
      requestResetPassword,
      verifyResetPassword,
      checkUserExist,
    }
  }