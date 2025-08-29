import { defineEventHandler, readBody, createError } from 'h3'
import Product from '@/server/models/ProductModel'
import type { OptionStock } from '~/types/product';

export default defineEventHandler(async (event) => {
    // 관리자 체크 (auth.server.ts에서 context.auth 넣고 있던 그 구조 그대로 사용)
    const role = (event.context as any).auth?.user?.role
    if (role !== 'admin') {
      throw createError({ statusCode: 403, statusMessage: 'Admin only' })
    }
  
    const body = await readBody<{
      name: string
      price: number
      image?: string // Blob URL
      description?: string
      stock?: number
      category?: string
      isSoldOut?: boolean
      detailImages?: string[]
      optionStocks?: OptionStock[]
    }>(event)
  
    if (!body?.name || typeof body.price !== 'number') {
      throw createError({ statusCode: 400, statusMessage: 'name/price 필요' })
    }
  
    const doc = await Product.create({
      name: body.name,
      price: body.price,
      image: body.image || '', // Blob CDN URL
      description: body.description || '',
      stock: body.stock ?? 0,
      category: body.category || '',
      isSoldOut: body.isSoldOut ?? false,
      detailImages: body.detailImages ?? [],
      optionStocks: body.optionStocks ?? [],
    })
  
    return {
      statusCode: 201,
      data: { _id: doc._id },
      message: '상품이 등록되었습니다.',
    }
  })