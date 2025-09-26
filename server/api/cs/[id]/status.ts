// server/api/cs/[id]/status.ts
import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import mongoose from 'mongoose'
import connectDB from '@/server/plugins/mongoose.server'
import Cs from '@/server/models/CsModel'

const isValidStatus = (s: any): s is 'pending' | 'answered' =>
  s === 'pending' || s === 'answered'

export default defineEventHandler(async (event) => {
  await connectDB()

  const auth = (event.context as any).auth
  const me = auth?.user
  if (!me) throw createError({ statusCode: 401, message: '로그인이 필요합니다.' })
  if ((me.role ?? 'user') !== 'admin') {
    throw createError({ statusCode: 403, message: '관리자만 상태를 변경할 수 있습니다.' })
  }

  const idRaw = String(getRouterParam(event, 'id') ?? '')
  if (!mongoose.Types.ObjectId.isValid(idRaw)) {
    throw createError({ statusCode: 400, message: '잘못된 문서 식별자' })
  }
  const _id = new mongoose.Types.ObjectId(idRaw)

  const body = await readBody<{ next?: string }>(event)
  const next = String(body?.next ?? '').trim()
  if (!isValidStatus(next)) {
    throw createError({ statusCode: 400, message: '허용되지 않은 상태 값' })
  }

  const updated = await Cs.findByIdAndUpdate(
    _id,
    { status: next, updatedAt: new Date() },
    { new: true }
  ).lean()

  if (!updated) {
    throw createError({ statusCode: 404, message: '존재하지 않는 문서' })
  }

  return { ok: true, status: next, doc: updated }
})
