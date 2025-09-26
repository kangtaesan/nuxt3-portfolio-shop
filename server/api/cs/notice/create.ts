import { defineEventHandler, readBody, createError } from 'h3'
import connectDB from '@/server/plugins/mongoose.server'
import CsNotice from '@/server/models/CsNoticeModel'

export default defineEventHandler(async (event) => {
  await connectDB()

  const auth = (event.context as any).auth
  const me = auth?.user
  if (!me || (me.role ?? 'user') !== 'admin') {
    throw createError({ statusCode: 403, message: '관리자만 가능합니다.' })
  }

  const body = await readBody(event)
  const title = String(body?.title ?? '').trim()
  const message = String(body?.message ?? '').trim()
  const enabled = Boolean(body?.enabled ?? true)

  if (!title || !message) {
    throw createError({ statusCode: 400, message: '제목/내용을 입력하세요.' })
  }

  const doc = await CsNotice.create({ title, message, enabled })
  return { ok: true, id: String(doc._id) }
})
