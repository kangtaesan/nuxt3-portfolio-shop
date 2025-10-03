import connectDB from '@/server/utils/mongoose'
export default connectDB
/* import mongoose from "mongoose"

export default async () => {
  try {
    await mongoose.connect(
      process.env.NUXT_MONGO_URI!
    )
    console.log("✅ MongoDB 연결 성공")
  } catch (err) {
    console.error("❌ MongoDB 연결 실패:", err)
  }
} */
