import mongoose from "mongoose"

export default async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://test:1234@cluster0.um5x1jx.mongodb.net/portfolio?retryWrites=true&w=majority&appName=Cluster0"
    )
    console.log("✅ MongoDB 연결 성공")
  } catch (err) {
    console.error("❌ MongoDB 연결 실패:", err)
  }
}
