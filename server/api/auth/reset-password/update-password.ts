import { defineEventHandler, readBody, createError } from 'h3'
import connectDB from '@/server/plugins/mongoose.server'
import User from '@/server/models/Usermodel'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  await connectDB()
  const userId = (event.context as any).auth?.user?.id
  if (!userId) throw createError({ statusCode: 401, statusMessage: '로그인 필요' })

  const { currentPassword, newPassword } =
    await readBody<{ currentPassword: string; newPassword: string }>(event)
  if (!currentPassword || !newPassword) {
    throw createError({ statusCode: 400, statusMessage: 'invalid payload' })
  }

  const user = await User.findById(userId).select('password').exec()
  if (!user) throw createError({ statusCode: 404, statusMessage: 'user not found' })

  const ok = await bcrypt.compare(currentPassword, (user as any).password)
  if (!ok) throw createError({ statusCode: 400, statusMessage: 'wrong password' })

  ;(user as any).password = await bcrypt.hash(newPassword, 6) 
  await user.save()

  return { ok: true }
})
