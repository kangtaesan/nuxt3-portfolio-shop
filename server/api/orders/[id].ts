import { defineEventHandler, readBody, createError } from 'h3'
import connectDB from '@/server/plugins/mongoose.server'
import Order from '@/server/models/OrderModel'

const ALLOWED: string[] = ['pending','paid','shipping','done','canceled','failed']

export default defineEventHandler(async (event) => {
  await connectDB()
  const id = (event.context.params as any).id as string
  const auth = (event.context as any).auth
  const role = auth?.user?.role ?? 'user'
  const userId = auth?.user?.id

  // PATCH — Admin only
  if (event.method === 'PATCH') {
    if (role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Admin only' })
    const { status } = await readBody<{ status: string }>(event)
    if (!ALLOWED.includes(status)) throw createError({ statusCode: 400, statusMessage: 'invalid status' })
    const updated = await Order.findByIdAndUpdate(id, { status }, { new: true }).lean()
    if (!updated) throw createError({ statusCode: 404, statusMessage: 'order not found' })
    return { ok: true, data: updated }
  }

  // DELETE — Admin only
  if (event.method === 'DELETE') {
    if (role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Admin only' })
    const r = await Order.findByIdAndDelete(id).lean()
    if (!r) throw createError({ statusCode: 404, statusMessage: 'order not found' })
    return { ok: true }
  }

  // GET — Admin은 전체 / 일반 사용자는 자기 것만
  if (!userId) throw createError({ statusCode: 401, statusMessage: '로그인 필요' })
  const doc = await Order.findOne(role === 'admin' ? { _id: id } : { _id: id, userId }).lean()
  if (!doc) throw createError({ statusCode: 404, statusMessage: 'order not found' })
  return { ok: true, data: doc }
})