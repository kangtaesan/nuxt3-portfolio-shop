// store/auth.ts 로그인 상태 저장 및 페이지 접근 제어
import { defineStore } from "pinia";
import { useCookie } from "#app";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as null | { id:string; username: string },
        token: null as null | string,
        initialized: false
        // 클라이언트에서 로그인 여부 판단이 완료됐는지 여부
        // cookieAuth.client.ts에서 false에서 true로 바뀌는 조건 3가지
        // 1. payload를 파싱해서 로그인 상태 복구한 경우 setAuth 호출 내부에서 true
        // 2. 쿠키가 있는데 토큰 파싱 실패한 경우 판단이 안되니 초기화만 완료
        // 3. 쿠키 자체가 없는 경우에 로그인 상태가 아님을 확인하고 초기화 완료
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        // !!는 boolean값으로 강제 변환시킬 때 사용 true/false
        // state.token에 값이 있다면 true 없다면 false를 반환해라의 로그인 상태 확인
        // boolean값으로 변환하지 않으면 string 타입으로 출력되어 조건문에서 사용하기 불리
    },

    actions: {
        setAuth(user: {id:string; username: string}, token: string) {
            this.user = user
            this.token = token
            this.initialized = true // 로그인 상태 판단 완료
        },
        logout() {
             // 서버 요청으로 쿠키 삭제
            $fetch('/api/auth/logout', { method: 'POST' })
            .catch(err => console.error('로그아웃 API 호출 실패:', err))
            // store 초기화
            this.user = null
            this.token = null 
            this.initialized = true // 로그아웃 상태 판단 완료

        },
    },
})