import { defineEventHandler, setCookie } from 'h3'

export default defineEventHandler((event) => {
  // 토큰 쿠키 삭제 (즉시 만료)
  setCookie(event, 'token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0, // 즉시 만료
    sameSite: 'lax',
  })

  return { statusCode: 200, message: '로그아웃 성공' }
})