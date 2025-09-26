// server/api/cs/[id]/reply.ts
import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import mongoose from 'mongoose'
import connectDB from '@/server/plugins/mongoose.server'
import Cs from '@/server/models/CsModel'

export default defineEventHandler(async (event) => {
  await connectDB()

  // 인증/권한
  const auth = (event.context as any).auth
  const me = auth?.user
  if (!me) throw createError({ statusCode: 401, message: '로그인이 필요합니다.' })
  if ((me.role ?? 'user') !== 'admin') {
    throw createError({ statusCode: 403, message: '관리자만 답변할 수 있습니다.' })
  }

  // 문서 id
  const idRaw = String(getRouterParam(event, 'id') ?? '')
  if (!mongoose.Types.ObjectId.isValid(idRaw)) {
    throw createError({ statusCode: 400, message: '잘못된 문서 식별자' })
  }
  const _id = new mongoose.Types.ObjectId(idRaw)

  // 메서드 분기
  const method = event.method.toUpperCase()

  // POST: 관리자 답변 추가 (기존 로직 유지)
  if (method === 'POST') {
    const body = await readBody<{ message?: string }>(event)
    const message = String(body?.message ?? '').trim()
    if (!message) throw createError({ statusCode: 400, message: '답변 내용을 입력하세요.' })

    const reply = {
      _id: new mongoose.Types.ObjectId(),
      adminId: new mongoose.Types.ObjectId(String(me._id || me.id)),
      adminName: String(me.nickname ?? me.username ?? '관리자'),
      message,
      createdAt: new Date(),
      updatedAt: new Date(), // [ADD] updatedAt 포함(추가 시점 기록)
    }

    const updated = await Cs.findOneAndUpdate(
      { _id },
      {
        $push: { replies: reply },
        $set: { status: 'answered', updatedAt: new Date() },
      },
      { new: true }
    ).lean()

    if (!updated) {
      throw createError({ statusCode: 404, message: '존재하지 않는 문서' })
    }

    return { ok: true, status: 'answered', doc: updated }
  }

  // [ADD] PATCH: 관리자 답변 수정
  //  - body.replyId가 있으면 그 답글만 수정
  //  - replyId 없으면 "가장 최근에 이 관리자가 단 답글"을 찾아 수정
  if (method === 'PATCH') {
    const body = await readBody<{ message?: string; replyId?: string }>(event)
    const message = String(body?.message ?? '').trim()
    if (!message) throw createError({ statusCode: 400, message: '수정할 내용을 입력하세요.' })

    const meId = String(me._id || me.id)
    if (!mongoose.Types.ObjectId.isValid(meId)) {
      throw createError({ statusCode: 400, message: '잘못된 관리자 식별자' })
    }
    const adminId = new mongoose.Types.ObjectId(meId)

    // 1) replyId가 온 경우: 해당 답글을 정확히 수정
    if (body?.replyId) {
      const rid = String(body.replyId)
      if (!mongoose.Types.ObjectId.isValid(rid)) {
        throw createError({ statusCode: 400, message: '잘못된 답글 식별자' })
      }
      const replyId = new mongoose.Types.ObjectId(rid)

      const updated = await Cs.findOneAndUpdate(
        { _id, 'replies._id': replyId },
        {
          $set: {
            'replies.$.message': message,
            'replies.$.updatedAt': new Date(),
            status: 'answered',
            updatedAt: new Date(),
          },
        },
        { new: true }
      ).lean()

      if (!updated) throw createError({ statusCode: 404, message: '수정할 답글을 찾을 수 없습니다.' })
      return { ok: true, doc: updated }
    }

    // 2) replyId가 없으면: 가장 최근에 이 관리자가 단 답글을 찾아 수정
    const doc = await Cs.findById(_id).lean()
    if (!doc) throw createError({ statusCode: 404, message: '존재하지 않는 문서' })

    const replies: any[] = Array.isArray((doc as any).replies) ? (doc as any).replies : []
    const lastAdminReply = [...replies]
      .reverse()
      .find(r => String(r.adminId) === String(adminId))

    if (!lastAdminReply) {
      throw createError({ statusCode: 400, message: '수정할 관리자 답변이 없습니다.' })
    }

    const lastId = new mongoose.Types.ObjectId(String(lastAdminReply._id))

    const updated = await Cs.findOneAndUpdate(
      { _id },
      {
        $set: {
          'replies.$[elem].message': message,
          'replies.$[elem].updatedAt': new Date(),
          status: 'answered',
          updatedAt: new Date(),
        },
      },
      {
        new: true,
        arrayFilters: [{ 'elem._id': lastId }],
      }
    ).lean()

    if (!updated) throw createError({ statusCode: 404, message: '수정에 실패했습니다.' })
    return { ok: true, doc: updated }
  }

  // 그 외 메서드
  throw createError({ statusCode: 405, message: '허용되지 않은 메서드' })
})
