import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import mongoose from 'mongoose'
import connectDB from '@/server/plugins/mongoose.server'
import CsNotice from '@/server/models/CsNoticeModel'

export default defineEventHandler(async (event) => {
  await connectDB()

  const id = String(getRouterParam(event, 'id') ?? '')
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: '잘못된 공지 선택' })
  }
  const _id = new mongoose.Types.ObjectId(id)
  const method = event.method.toUpperCase()

  // GET: 모두 조회 가능
  if (method === 'GET') {
    const doc = await CsNotice.findById(_id).lean()
    if (!doc) throw createError({ statusCode: 404, message: '존재하지 않는 공지' })
    return { ok: true, doc }
  }

  // 관리자 권한 확인 (PATCH/DELETE)
  const auth = (event.context as any).auth
  const role = auth?.user?.role
  if (role !== 'admin') {
    throw createError({ statusCode: 403, message: '관리자만 가능합니다.' })
  }

  if (method === 'PATCH') {
    const body = await readBody(event)
    const update: any = {}
    if (typeof body?.title === 'string')   update.title   = body.title.trim()
    if (typeof body?.message === 'string') update.message = body.message.trim()

    const doc = await CsNotice.findByIdAndUpdate(_id, update, { new: true }).lean()
    if (!doc) throw createError({ statusCode: 404, message: '존재하지 않는 공지' })
    return { ok: true, id, doc }
  }

  if (method === 'DELETE') {
    await CsNotice.deleteOne({ _id })
    return { ok: true, id }
  }

  throw createError({ statusCode: 405, message: '허용되지 않은 메서드' })
})
