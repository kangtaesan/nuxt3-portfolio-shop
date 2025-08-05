import { defineEventHandler, readBody } from 'h3'
import VerificationModel from '~/server/models/VerificationModel'
import UserModel from '~/server/models/Usermodel'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ contact: string; code: string }>(event)
  const { contact, code } = body

  // 1. 필수값 확인
  if (!contact || !code) {
    return { statusCode: 400, message: '연락처와 인증번호를 모두 입력해주세요.' }
  }

  // 2. 인증번호 검증
  const verification = await VerificationModel.findOne({ contact, code })
  if (!verification) {
    return { statusCode: 400, message: '인증번호가 올바르지 않거나 만료되었습니다.' }
  }

  // 3. 사용자 조회
  const user = await UserModel.findOne({ 
    $or: [{ email: contact }, { phone: contact }] 
  })

  if (!user) {
    return { statusCode: 404, message: '등록된 사용자가 없습니다.' }
  }

  // 4. username 반환
  return {
    statusCode: 200,
    message: '아이디 찾기 성공',
    username: user.username
  }
})