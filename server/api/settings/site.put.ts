import connectDB from '@/server/plugins/mongoose.server'
import SiteSettings from '@/server/models/SiteSettings'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  await connectDB()
  const auth = (event.context as any).auth
  if (auth?.user?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: '관리자만 수정 가능' })
  }
  const body = await readBody(event)
  const doc = await SiteSettings.findOneAndUpdate({}, body, { upsert:true, new:true })
  return { ok:true, data: doc }
})