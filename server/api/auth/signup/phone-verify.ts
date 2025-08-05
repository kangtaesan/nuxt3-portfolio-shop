// server/api/auth/phone-verify.ts
import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
const body = await readBody<{ phone?: string; code?: string }>(event)
const { phone, code } = body

if (!phone || !phone.trim()) {
  return { statusCode: 400, message: '휴대폰 번호를 입력해주세요.' }
}
if (!code || !code.trim()) {
  return { statusCode: 400, message: '인증번호를 입력해주세요.' }
}

try {
  const gt = globalThis as any
  const storedCode = gt.phoneCodes?.[phone]


  if (!storedCode) {
  return { statusCode: 400, message: '인증번호가 존재하지 않습니다.' }
  }
  if (Date.now() > storedCode.expiresAt) {
  delete gt.phoneCodes[phone]
  return { statusCode: 400, message: '인증번호가 만료되었습니다.' }
  }
  
  if (storedCode.code !== code) {
  return { statusCode: 400, message: '인증번호가 올바르지 않습니다.' }
  }
  // 인증 성공 시 코드 삭제 (한 번만 사용되도록)
  delete gt.phoneCodes[phone]
  return { statusCode: 200, message: '휴대폰 인증이 완료되었습니다.' }
} catch (error) {
  return { statusCode: 500, message: '휴대폰 인증 검증 중 오류가 발생했습니다.' }
}
})