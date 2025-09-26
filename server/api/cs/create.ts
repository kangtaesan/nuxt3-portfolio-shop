import { defineEventHandler, readBody, createError } from 'h3'
import mongoose from 'mongoose'
import connectDB from '@/server/plugins/mongoose.server'
import Cs from '@/server/models/CsModel'

export default defineEventHandler(async (event) => {
  await connectDB()

  // 인증
  const auth = (event.context as any).auth
  const user = auth?.user
  if (!user) throw createError({ statusCode: 401, message: '로그인이 필요합니다.' })

  const body = await readBody(event) as any

  // 필수값 정리
  const title = String(body?.title ?? '').trim()
  const content = String(body?.content ?? '').trim()
  if (!title || !content) {
    throw createError({ statusCode: 400, message: '제목과 내용을 입력하세요.' })
  }

  // 선택값 정리
  const nickname =
    String(body?.nickname ?? user.nickname ?? user.username ?? '').trim() || '사용자'
  const category = body?.category ? String(body.category).trim() : null

  // orderId(선택) 캐스팅
/*   let orderId: any = null
  if (typeof body?.orderId === 'string' && body.orderId.trim()) {
    if (!mongoose.Types.ObjectId.isValid(body.orderId)) {
      throw createError({ statusCode: 400, message: '잘못된 주문 식별자' })
    }
    orderId = new mongoose.Types.ObjectId(String(body.orderId))
  } */

  // 유효성 검사 통과한 경우에만 objectId 생성
  const orderId: mongoose.Types.ObjectId | null =
  (typeof body?.orderId === 'string' && body.orderId.trim() 
  && mongoose.Types.ObjectId.isValid(body.orderId))
  ? new mongoose.Types.ObjectId(String(body.orderId))
  : null

  // userId 캐스팅
  const userIdRaw = user._id || user.id
  if (!mongoose.Types.ObjectId.isValid(String(userIdRaw))) {
    throw createError({ statusCode: 400, message: '잘못된 사용자 식별자' })
  }
  const userId = new mongoose.Types.ObjectId(String(userIdRaw))

  // 저장 (status는 스키마 default: 'pending')
  const doc = await Cs.create({
    userId,
    nickname,
    title,
    content,
    orderId, // null 가능
    category, // null 가능
    // status → default: 'pending' 
    // 답글 추가 api에서 status: 'answered' 저장
  })
    
  return { ok: true, id: String(doc._id) }
})
