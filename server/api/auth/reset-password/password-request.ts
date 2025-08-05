import { defineEventHandler, readBody } from 'h3'
import UserModel from '~/server/models/Usermodel'
import VerificationModel from '~/server/models/VerificationModel'
import { sendVerificationSMS, sendVerificationEmailCode } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username: string }>(event)
  const { username } = body

  if (!username) {
    return { statusCode: 400, message: '아이디를 입력해주세요.' }
  }

  const user = await UserModel.findOne({ username })
  if (!user) {
    return { statusCode: 404, message: '해당 아이디가 존재하지 않습니다.' }
  }

  // 인증번호 생성
  const code = Math.floor(100000 + Math.random() * 900000).toString()

  // DB 저장
  await VerificationModel.create({
    contact: user.email || user.phone,
    code,
    expireAt: new Date(Date.now() + 3 * 60 * 1000) // 3분 후 만료
  })

  // 전송
  if (user.email) {
    await sendVerificationEmailCode(user.email, code)
  } else if (user.phone) {
    await sendVerificationSMS(user.phone, code)
  }

  return { statusCode: 200, message: '인증번호가 전송되었습니다.' }
})