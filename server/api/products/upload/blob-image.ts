// server/api/products/upload/blob-image.ts
import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { put } from '@vercel/blob'

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  //readMultipartFormData로인해 part 배열이 생성됨(name, filename, type, data(buffer))
  if (!parts) throw createError({ statusCode: 400, statusMessage: '폼데이터 없음' })

  const filePart = parts.find((part) => part.name === 'file' && part.filename)
  if (!filePart) throw createError({ statusCode: 400, statusMessage: 'file 필요' })

  const { blobToken } = useRuntimeConfig()
  const ext = (filePart.type?.split('/')[1] || 'bin').toLowerCase()
  const key = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { url } = await put(key, filePart.data!, {
    access: 'public',
    token: blobToken,
    contentType: filePart.type,
  })

  return { url }
})