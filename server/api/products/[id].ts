import Product from '~/server/models/ProductModel'
import { defineEventHandler, createError, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing product ID' })
  }

  // ✅ GET: 상품 조회
  if (event.method === 'GET') {
    const product = await Product.findById(id).lean()
    if (!product) {
      throw createError({ statusCode: 404, statusMessage: '상품 없음' })
    }
    return product
  }

  // ✅ PUT: 상품 수정
  if (event.method === 'PUT') {
    const body = await readBody(event)
    const updated = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true })
    if (!updated) {
      throw createError({ statusCode: 404, statusMessage: '수정 실패' })
    }
    return updated
  }

  // ✅ DELETE: 상품 삭제
  if (event.method === 'DELETE') {
    const deleted = await Product.findByIdAndDelete(id)
    if (!deleted) {
      throw createError({ statusCode: 404, statusMessage: '삭제 대상 없음' })
    }
    return { ok: true }
  }
})