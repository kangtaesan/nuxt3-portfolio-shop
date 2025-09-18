import { defineEventHandler, createError } from 'h3'
import connectDB from '@/server/plugins/mongoose.server'
import Order from '@/server/models/OrderModel'

export default defineEventHandler(async (event) => {
  await connectDB()
  const userId = (event.context as any).auth?.user?.id
  if (!userId) throw createError({ statusCode: 401, statusMessage: '로그인 필요' })

  const last = await Order.findOne({ userId })
    .sort({ createdAt: -1 })
    .select('ordererName ordererPhone shippingAddr note')
    .lean()

  return last ?? null
})