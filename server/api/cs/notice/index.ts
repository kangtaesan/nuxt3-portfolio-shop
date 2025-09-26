import { defineEventHandler, getQuery } from 'h3'
import connectDB from '@/server/plugins/mongoose.server'
import CsNotice from '@/server/models/CsNoticeModel'

export default defineEventHandler(async (event) => {
  await connectDB()

  const auth = (event.context as any).auth
  const me = auth?.user
  if (!me || (me.role ?? 'user') !== 'admin') {
    throw createError({ statusCode: 403, message: '관리자만 가능합니다.' })
  }

  const q = getQuery(event)
  const page  = Math.max(1, Number(q.page ?? 1))
  const limit = Math.min(100, Math.max(1, Number(q.limit ?? 20)))
  const enabled = String(q.enabled ?? '').trim()

  const filter: any = {}
  if (enabled === 'true')  filter.enabled = true
  if (enabled === 'false') filter.enabled = false

  const total = await CsNotice.countDocuments(filter)
  const items = await CsNotice.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()

  return { items, meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } }
})
