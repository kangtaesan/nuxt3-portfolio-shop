import { defineEventHandler, readBody } from 'h3'
import VerificationModel from '~/server/models/VerificationModel'
import UserModel from '~/server/models/Usermodel'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username: string; code: string; newPassword?: string }>(event)
  const { username, code, newPassword } = body

  // 1. 인증번호 검증 단계
  const verification = await VerificationModel.findOne({ code })
  if (!verification) {
    return { statusCode: 400, message: '잘못된 인증번호입니다.' }
  }

  // 2. 새 비밀번호가 전달되면 비밀번호 업데이트 단계
  if (newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 6)
    await UserModel.updateOne({ username }, { $set: { password: hashedPassword } })
    await VerificationModel.deleteOne({ code }) // 인증번호 제거
    return { statusCode: 200, message: '비밀번호가 성공적으로 변경되었습니다.' }
  }

  return { statusCode: 200, message: '인증번호 확인 완료. 비밀번호 재설정 진행하세요.' }
})