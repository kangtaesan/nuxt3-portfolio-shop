// server/api/auth/login.ts
import { defineEventHandler, readBody, setCookie } from 'h3'
// h3: Nuxt 3의 백엔드 서버 엔진인 Nitro의 핵심 라이브러리, 서버 API 요청을 처리 목적
import bcrypt from 'bcrypt'
import UserModel from '~/server/models/Usermodel'
import { generateToken } from '~/server/utils/auth'

export default defineEventHandler( async (event) => {
    const body = await readBody(event)
    console.log('📦 body:', body)
    const { username, password } = body

    if(!username || !password) {
        return {
            statusCode: 400,
            message: '아이디와 비밀번호를 입력해주세요',
        }
    }
    // username으로 유저 전체 문서 조회 (password 포함)
    const user = await UserModel.findOne({username})
    console.log('🔍 user:', user)
    if(!user) {
        return {
            statusCode: 401,
            message: '존재하지 않는 사용자입니다',
        }
    }

    const isValid = await bcrypt.compare(password, user.password)

    if(!isValid) {
        return {
            statusCode: 401,
            message: '비밀번호가 일치하지 않습니다',
        }
    }
    // MongoDB는 모든 문서에 고유 식별자 _id 필드를 생성
    const token = generateToken({
        id: user._id,
        username: user.username,
        role: user.role,
    })
    console.log('✅ 로그인 성공. 토큰:', token)

    // setCookie(event, name, value, options?) - 브라우저에 토큰 저장 목적
    setCookie(event, 'token', token, {
        httpOnly: true, // 클라이언트 JS에서 접근 불가능하도록 설정 (XSS 보호용, 강력히 권장)
        secure: true, 
        // secure: process.env.NODE_ENV === 'production', // HTTPS에서만 쿠키 전송
        path: '/', // 루트 경로 이하 전체 요청에 대해 쿠키 전송('/' 기본값)
        maxAge: 60 * 60 * 24 * 7, // 7일(초단위, 7일 = 604800초)
        sameSite: 'none' // 교차 출처 요청 제한(strict: 가장엄격, lax: 로그인 허용, none: 없음)
        // OAuth 로그인(카카오, 네이버 등)처럼 외부 도메인을 오갈 때 'none'+ secure: true 
    })

    // event.context에 로그인 정보 직접 세팅 (SSR용)
    event.context.auth = {
    user: {
      id: user._id,
      username: user.username,
      nickname: user.nickname,
    },
    token,
    }

    return {
        statusCode: 200,
        message: '로그인 성공',
        token,
        user: {
            id: user._id,
            username: user.username,
            nickname: user.nickname,
        }
    }
})