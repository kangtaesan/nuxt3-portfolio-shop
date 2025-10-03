// server/utils/mongoose.ts
import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGODB_URI
if (!MONGO_URI) throw new Error('MONGODB_URI is missing')
const uri: string = MONGO_URI

// 전역 캐시(서버리스에서 요청마다 재사용)
type G = typeof globalThis & {
  _mongooseConn?: typeof mongoose | null
  _mongooseInit?: Promise<typeof mongoose> | null
}
const g = globalThis as G
g._mongooseConn ??= null
g._mongooseInit ??= null

export default async function connectDB() {
  // 이미 연결돼 있으면 재사용
  if (g._mongooseConn && mongoose.connection.readyState === 1) {
    return g._mongooseConn
  }
  // 연결 진행 중이면 그 프라미스 재사용
  if (g._mongooseInit) return g._mongooseInit

  // Mongoose 기본 동작 최적화
  mongoose.set('bufferCommands', false)

  // “빨리 실패” 옵션: 무한 로딩 방지
  g._mongooseInit = mongoose
    .connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 3000, // 3초 안에 서버 못 고르면 에러
      socketTimeoutMS: 45000,
    })
    .then((m) => {
      g._mongooseConn = m
      return m
    })
    .finally(() => {
      g._mongooseInit = null
    })

  return g._mongooseInit
}
