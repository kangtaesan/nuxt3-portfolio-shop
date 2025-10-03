import { defineEventHandler, getQuery, createError } from 'h3'
import mongoose from 'mongoose'
import connectDB from '@/server/plugins/mongoose.server'
import Cs from '@/server/models/CsModel'

export default defineEventHandler(async (event) => {
  await connectDB()

  // 인증
  const auth = (event.context as any).auth
  const user = auth?.user
  if (!user) throw createError({ statusCode: 401, message: '로그인이 필요합니다.' })

  const role = user.role ?? 'user'
  const userId = user._id || user.id

  // 페이지/리밋
  const page  = Math.max(1, Number(getQuery(event).page  ?? 1))
  const limit = Math.min(100, Math.max(1, Number(getQuery(event).limit ?? 20)))

  // 상태 필터 (선택)
  const statusRaw = String(getQuery(event).status ?? '').trim() // 'pending' | 'answered' | ''
  const filter: any = {}

  // 일반 사용자는 본인 글만
/*   if (role !== 'admin') {
    if (!mongoose.Types.ObjectId.isValid(String(userId))) {
      throw createError({ statusCode: 400, message: '잘못된 사용자 식별자' })
    }
    filter.userId = new mongoose.Types.ObjectId(String(userId))
  } */

  if (statusRaw === 'pending' || statusRaw === 'answered') {
    filter.status = statusRaw
  }

  // 조회
  const total = await Cs.countDocuments(filter)
  const items = await Cs.find(filter)
    .sort({ _id: -1 })                // 최신순
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  }
})
