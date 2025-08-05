// server/api/auth/reset-password/check-user.ts
import { defineEventHandler, readBody } from 'h3'
import UserModel from '~/server/models/Usermodel'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username: string }>(event)
  const { username } = body

  if (!username) {
    return { statusCode: 400, message: '아이디를 입력해주세요.' }
  }

  const user = await UserModel.findOne({ username })
  if (!user) {
    return { statusCode: 404, message: '등록된 사용자가 없습니다.' }
  }

  return { statusCode: 200, message: '사용자 확인 완료' }
})