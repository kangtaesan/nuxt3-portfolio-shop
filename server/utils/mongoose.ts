// server/utils/mongoose.ts
import mongoose from 'mongoose'

declare global {
  // 캐시: warm 워커에서 재사용
  // eslint-disable-next-line no-var
  var _mongooseConn: typeof mongoose | null | undefined
  // eslint-disable-next-line no-var
  var _mongooseInitPromise: Promise<typeof mongoose> | null | undefined
}

const uri = process.env.NUXT_MONGO_URI as string

export default async function connectDB() {
  // 이미 연결되어 있으면 바로 반환
  if (global._mongooseConn && mongoose.connection.readyState === 1) {
    return global._mongooseConn
  }

  // 초기화 중이면 그 프라미스 재사용 (동시 호출 중복 방지)
  if (global._mongooseInitPromise) {
    return global._mongooseInitPromise
  }

  mongoose.set('bufferCommands', false)

  global._mongooseInitPromise = mongoose.connect(uri, {
    maxPoolSize: 10,            // 과도한 커넥션 생성 방지
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    // keepAlive 등의 옵션을 URI 쿼리로 넣어도 됨
  }).then((m) => {
    global._mongooseConn = m
    return m
  }).finally(() => {
    // 성공/실패 상관없이 초기화 큐는 비워줌
    global._mongooseInitPromise = null
  })

  return global._mongooseInitPromise
}
