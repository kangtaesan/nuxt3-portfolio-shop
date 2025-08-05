import { defineEventHandler, readBody } from 'h3'
import { generateToken, sendVerificationEmail } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string }>(event)
  const { email } = body

  if (!email) {
    return { statusCode: 400, message: '이메일을 입력해주세요.' }
  }

  try {
    const token = generateToken({ email })
    await sendVerificationEmail(email, token)

    return {
      statusCode: 200,
      message: '인증 메일이 전송되었습니다.',
      data: { token }
    }
  } catch {
    return { statusCode: 500, message: '이메일 인증 요청 중 오류가 발생했습니다.' }
  }
})