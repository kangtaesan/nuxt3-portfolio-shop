import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import mongoose from 'mongoose'
import connectDB from '@/server/plugins/mongoose.server'
import CsNotice from '@/server/models/CsNoticeModel'

export default defineEventHandler(async (event) => {
  await connectDB()

  const auth = (event.context as any).auth
  const me = auth?.user
  if (!me || (me.role ?? 'user') !== 'admin') {
    throw createError({ statusCode: 403, message: '관리자만 가능합니다.' })
  }

  const id = String(getRouterParam(event, 'id') ?? '')
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: '잘못된 공지 식별자' })
  }
  const _id = new mongoose.Types.ObjectId(id)

  const method = event.method.toUpperCase()

  // GET : 단건 조회
  if (method === 'GET') {
    const doc = await CsNotice.findById(_id).lean()
    if (!doc) throw createError({ statusCode: 404, message: '존재하지 않는 공지' })
    return doc
  }

  // PATCH : 수정(제목/내용/활성)
  if (method === 'PATCH') {
    const body = await readBody(event)
    const update: any = {}
    if (typeof body?.title === 'string')   update.title = body.title.trim()
    if (typeof body?.message === 'string') update.message = body.message.trim()
    if (typeof body?.enabled === 'boolean') update.enabled = body.enabled

    const doc = await CsNotice.findByIdAndUpdate(_id, update, { new: true }).lean()
    if (!doc) throw createError({ statusCode: 404, message: '존재하지 않는 공지' })
    return { ok: true, id, doc }
  }

  // DELETE : 삭제
  if (method === 'DELETE') {
    await CsNotice.deleteOne({ _id })
    return { ok: true, id }
  }

  throw createError({ statusCode: 405, message: '허용되지 않은 메서드' })
})
