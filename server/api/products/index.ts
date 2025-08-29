import Product from '@/server/models/ProductModel'

export default defineEventHandler(async () => {
    // { createdAt: -1 } → 최신순, { createdAt: 1 } -> 오래된 순
    // lean()을 통해 Mongoose의 Document를 JS 객체 형태로 반환
    const products = await Product.find().sort({ createdAt: -1 }).lean()
    return {
        statusCode: 200,
        data: products
    }
})