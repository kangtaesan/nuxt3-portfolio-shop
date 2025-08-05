// setCookie: {httpOnly: false} 시에 사용 - CSR
// 클라이언트 진입 시 쿠키에 저장된 토큰을 읽어서 store에 로그인 상태 반영
// *.client.ts -> 브라우저(클라이언트)에서만 실행됨

import { useAuthStore } from "@/store/auth";
import { useCookie } from "#app";

export default defineNuxtPlugin(() => {
    const authStore = useAuthStore()
    const token = useCookie('token')
    // login.ts에서 정의한 setCookie의 token의 name

    // 로그인 상태가 아닌 경우에만 토큰을 파싱해서 로그인 상태로 세팅
    if(token.value && !authStore.isAuthenticated) {
        // JWT로 정의한 token의 payload로 넘긴 id와 username을 꺼내오는 구문
        try {
            // Base64로 .을 기준으로 인코딩 된 JWT token을 split으로 분리
            // [0]:header, [1]:payload, [2]: signature
            // atob는 Base64를 디코딩, JSON.parse는 문자열을 객체로 변환
            const payload = JSON.parse(atob(token.value.split('.')[1]))
            const user = {
                id: payload.id,
                username: payload.username
            }

            authStore.setAuth(user, token.value)

        } catch (error) {
            console.error('❌ 토큰 파싱 실패:', error)
            authStore.initialized = true // 판단 완료 처리
        } 
    } else {
        authStore.initialized = true // 로그인 상태가 아님으로 판단
    }
})