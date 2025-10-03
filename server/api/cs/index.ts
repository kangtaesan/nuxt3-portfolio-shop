import { defineEventHandler, getQuery } from 'h3'
import connectDB from '@/server/plugins/mongoose.server'
import CsNotice from '@/server/models/CsNoticeModel'

export default defineEventHandler(async (event) => {
  await connectDB()

  const q = getQuery(event)
  const page  = Math.max(1, Number(q.page ?? 1))
  const limit = Math.min(100, Math.max(1, Number(q.limit ?? 20)))

  const total = await CsNotice.countDocuments({})
  const items = await CsNotice.find({})
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()

  return { items, meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } }
})
