// server/api/cs/[id].ts
import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import mongoose from 'mongoose'
import connectDB from '@/server/plugins/mongoose.server'
import Cs from '@/server/models/CsModel'

export default defineEventHandler(async (event) => {
  type LeanCs = { _id: mongoose.Types.ObjectId; userId: mongoose.Types.ObjectId }

  await connectDB()

  // 인증 (열람도 로그인 필요 정책 유지)
  const auth = (event.context as any).auth
  const me = auth?.user
  if (!me) throw createError({ statusCode: 401, message: '로그인이 필요합니다.' })

  const role = me.role ?? 'user'
  const meIdRaw = me._id || me.id

  // id 검증
  const id = String(getRouterParam(event, 'id') ?? '')
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, message: '잘못된 문서 식별자' })
  }
  const _id = new mongoose.Types.ObjectId(id)

  const method = event.method.toUpperCase()

  // ── GET: 상세 (열람은 누구나 가능 / 소유·권한 플래그만 내려줌)
  if (method === 'GET') {
    const doc = await Cs.findById(_id).lean() as LeanCs | null
    if (!doc) throw createError({ statusCode: 404, message: '존재하지 않는 문서' })

    const isOwner =
      mongoose.Types.ObjectId.isValid(String(meIdRaw)) &&
      String(doc.userId) === String(meIdRaw)
    const isAdmin = role === 'admin'

    return {
      ...doc,
      _isOwner: isOwner,
      _canEdit: isOwner || isAdmin,
    }
  }

  // ── PATCH / DELETE: 작성자 또는 관리자만
  const base = await Cs.findById(_id).lean() as LeanCs | null
  if (!base) throw createError({ statusCode: 404, message: '존재하지 않는 문서' })

  const isOwner =
    mongoose.Types.ObjectId.isValid(String(meIdRaw)) &&
    String(base.userId) === String(meIdRaw)
  const isAdmin = role === 'admin'

  if (!isOwner && !isAdmin) {
    throw createError({ statusCode: 403, message: '권한이 없습니다.' })
  }

  // ── PATCH: 제목/내용/카테고리/주문연결만 수정 (status/replies는 별도 API)
  if (method === 'PATCH') {
    const body = await readBody(event)

    const update: any = {}
    if (typeof body?.title === 'string')   update.title   = body.title.trim()
    if (typeof body?.content === 'string') update.content = body.content.trim()
    if (typeof body?.category === 'string' || body?.category === null) {
      update.category = body?.category ? String(body.category).trim() : null
    }
    if (typeof body?.orderId === 'string' || body?.orderId === null) {
      const raw = String(body?.orderId ?? '').trim()
      if (raw) {
        if (!mongoose.Types.ObjectId.isValid(raw)) {
          throw createError({ statusCode: 400, message: '잘못된 주문 식별자' })
        }
        update.orderId = new mongoose.Types.ObjectId(raw)
      } else {
        update.orderId = null
      }
    }

    if (Object.keys(update).length === 0) {
      return { ok: true, id } // 변경사항 없음
    }

    const updated = await Cs.findByIdAndUpdate(_id, update, { new: true }).lean()
    return { ok: true, id, doc: updated }
  }

  // ── DELETE
  if (method === 'DELETE') {
    await Cs.deleteOne({ _id })
    return { ok: true, id }
  }

  throw createError({ statusCode: 405, message: '허용되지 않은 메서드' })
})
