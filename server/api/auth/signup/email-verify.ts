import { defineEventHandler, getQuery } from 'h3'
import { verifyToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = getQuery(event)
  const { token } = body

  if (!token) {
    return { statusCode: 400, message: '토큰이 없습니다.' }
  }

  try {
    const payload = verifyToken(token as string)
    if (!payload || typeof payload === 'string') {
      return { statusCode: 400, message: '유효하지 않은 토큰입니다.' }
    }

    // 필요하다면 여기서 DB 업데이트 로직 추가
    return { statusCode: 200, message: '이메일 인증 성공' }
  } catch(error) {
    return { statusCode: 500, message: '토큰 검증 실패' }
  }
})