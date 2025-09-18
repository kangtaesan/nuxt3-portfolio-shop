import { defineEventHandler, readBody, createError } from 'h3'
import connectDB from '@/server/plugins/mongoose.server'
import User from '@/server/models/Usermodel'

export default defineEventHandler(async (event) => {
  await connectDB()
  const userId = (event.context as any).auth?.user?.id
  if (!userId) throw createError({ statusCode: 401, statusMessage: '로그인 필요' })

  const body = await readBody<{ email?: string; phone?: string; nickname?: string }>(event)

  const update: any = {}
  if (body.email !== undefined) update.email = body.email
  if (body.phone !== undefined) update.phone = body.phone
  if (body.nickname !== undefined) update.nickname = body.nickname

  await User.findByIdAndUpdate(userId, { $set: update }).lean()
  return { ok: true }
})
