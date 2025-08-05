// setCookie: {httpOnly: true} 시에 사용 - SSR
// server/middleware/auth.server.ts
import { defineEventHandler, getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'token')
  if (!token) {
    event.context.auth = null
    return
  }

  try {
    const payload = JSON.parse(
      // Buffer.from(...).toString()는 Base64를 디코딩 
      Buffer.from(token.split('.')[1], 'base64').toString()
    )

    event.context.auth = {
      user: {
        id: payload.id,
        username: payload.username,
        role: payload.role,
      },
      token,
    }
    console.log('[SSR] event.context.auth:', event.context.auth)
  } catch (error) {
    console.error('❌ 서버에서 토큰 파싱 실패:', error)
    event.context.auth = null
  }
})