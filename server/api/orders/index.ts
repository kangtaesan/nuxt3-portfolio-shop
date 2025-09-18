import { defineEventHandler, getQuery, createError } from 'h3'
import connectDB from '@/server/plugins/mongoose.server'
import Order from '@/server/models/OrderModel'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  await connectDB()

  // ── 권한/유저
  const auth = (event.context as any).auth
  const role = auth?.user?.role ?? 'user'
  const userId = auth?.user?.id
  if (!userId) throw createError({ statusCode: 401, statusMessage: '로그인이 필요합니다.' })

  // ── 쿼리
  const q = String(getQuery(event).q ?? '').trim()
  const status = String(getQuery(event).status ?? '').trim()
  const page = Math.max(1, Number(getQuery(event).page ?? 1))
  const limit = Math.min(100, Math.max(1, Number(getQuery(event).limit ?? 20)))
  const from = String(getQuery(event).from ?? '').trim()
  const to = String(getQuery(event).to ?? '').trim()

  // ── 필터
  const filter: any = {}

  // 일반 사용자는 자기 것만, 관리자는 전체
  if (role !== 'admin') {
    filter.userId = userId
  }

  // 텍스트 검색 (주문자/전화/주소/메모/상품명) + 주문번호(hex 24자리) 바로 매칭
  if (q) {
    const rx = new RegExp(q, 'i')
    filter.$or = [
      { ordererName: rx },
      { ordererPhone: rx },
      { shippingAddr: rx },
      { note: rx },
      { 'items.name': rx },
    ]
    if (/^[0-9a-fA-F]{24}$/.test(q)) {
      (filter.$or as any[]).push({ _id: new mongoose.Types.ObjectId(q) })
    }
  }

  if (status) filter.status = status

  // 날짜범위 [from 00:00:00 ~ to 23:59:59]
  if (from || to) {
    const range: any = {}
    if (from) { const s = new Date(from); s.setHours(0,0,0,0); range.$gte = s }
    if (to)   { const e = new Date(to);   e.setHours(23,59,59,999); range.$lte = e }
    filter.createdAt = range
  }

  const total = await Order.countDocuments(filter)
  const list = await Order.find(filter)
    .sort({ _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()

  // 프론트 편의 필드
  const items = list.map((doc: any) => ({
    ...doc,
    itemsCount: Array.isArray(doc.items) ? doc.items.length : 0,
  }))


  return {
    items,
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  }
})