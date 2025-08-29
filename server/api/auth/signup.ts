// server/api/auth/signup.ts
import { defineEventHandler, readBody, sendError, createError, setResponseStatus } from 'h3'
// h3: Nuxt 3의 백엔드 서버 엔진인 Nitro의 핵심 라이브러리, 서버 API 요청을 처리 목적
import bcrypt from 'bcrypt'
// npm install bcrypt npm install -D @types/bcrypt 
import UserModel from '@/server/models/Usermodel'
import { verifyToken } from '~/server/utils/auth'

// defineEventHandler(handler) - Nuxt3 API 라우트 정의
// event - HTTP 요청정보 담고 있는 객체
// readBody() - HTTP 요청의 body를 JSON으로 파싱해서 객체로 넘김
export default defineEventHandler(async (event) => {
  const body = await readBody<{
    username: string
    password: string
    nickname: string
    token: string // 이메일 인증 토큰
    phone?: string // 휴대폰 번호 (선택)
  }>(event)
  const { username, password, nickname, token, phone } = body || {}

  // 1. 입력값 체크
  if (!username || !password || !nickname || !token) {
    return sendError(event, createError({
      statusCode: 400,
      message: '모든 필드를 입력해주세요.',
    }))
  }

  try {
    // 2. 토큰 검증
    const payload = verifyToken(token)

    if (typeof payload === 'string' || !('email' in payload)) {
      return sendError(event, createError({
        statusCode: 400,
        message: '토큰 정보가 유효하지 않습니다.',
      }))
    }

    const { email } = payload as { email: string }

    // 3. 중복 사용자 체크
    const existsUser = await UserModel.findOne({ username })
    if (existsUser) {
      return sendError(event, createError({
        statusCode: 409,
        message: '이미 존재하는 아이디입니다.'
      }))
    }
    const existsNickname = await UserModel.findOne({ nickname })
      if (existsNickname) {
      return sendError(event, createError({
        statusCode: 410,
        message: '이미 존재하는 닉네임입니다.',
      }))
    }
    const existsEmail = await UserModel.findOne({ email })
    if (existsEmail) {
      return sendError(event, createError({
        statusCode: 411,
        message: '이미 사용된 이메일입니다.'
      }))
    }

    // 4. 비밀번호 복잡성 체크
    if (password.length < 8 || !/[!@#$%^&*]/.test(password)) {
      return sendError(event, createError({
        statusCode: 422,
        message: '비밀번호는 8자 이상이며 특수문자를 포함해야 합니다.'
      }))
    }

    // 5. 비밀번호 해시 후 사용자 생성, 기본값 10/테스트용 4-6
    const hashedPassword = await bcrypt.hash(password, 6)

    const newUser = await UserModel.create({
      username,
      password: hashedPassword,
      nickname,
      email,
      phone,
    })
    
    setResponseStatus(event, 201)
    return {
      statusCode: 201,
      message: '회원가입이 완료되었습니다.',
      user: {
        username: newUser.username,
        nickname: newUser.nickname,
        email: newUser.email,
        phone: newUser.phone,
      },
    }

  } catch (error: any) {
    if (error.code === 11000) {
      if (error?.keyPattern?.username) {
        return sendError(event, createError({ statusCode: 409, message: '이미 존재하는 아이디입니다.' }))
      }
      if (error?.keyPattern?.nickname) {
        return sendError(event, createError({ statusCode: 410, message: '이미 존재하는 닉네임입니다.' }))
      }
      if (error?.keyPattern?.email) {
        return sendError(event, createError({ statusCode: 411, message: '이미 사용된 이메일입니다.' }))
      }
    }
    console.error('[signup] server error:', error)
    return sendError(event, createError({ statusCode: 500, message: '서버 오류: 회원가입 처리 중 문제가 발생했습니다.' }))
  }
})
  // MongoDB 스키마 유효성 검증 실패 에러 121