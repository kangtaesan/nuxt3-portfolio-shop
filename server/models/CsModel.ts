import mongoose from 'mongoose'

// 관리자 답글 서브문서
const ReplySchema = new mongoose.Schema(
  {
    adminId:   { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    adminName: { type: String, required: true, trim: true },
    message:   { type: String, required: true, trim: true },
  },
  {
    _id: true,
    timestamps: { createdAt: true, updatedAt: false },
  }
)

// CS 본문 
const CsSchema = new mongoose.Schema(
  {
    // 작성자
    userId:   { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    nickname: { type: String, required: true, trim: true },

    // 내용
    title:   { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },

    // 주문과 연동
    orderId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },

    // 분류
    category: { type: String, default: null, trim: true },

    // 상태
    status:   { type: String, enum: ['pending', 'answered'], default: 'pending', index: true },

    // 관리자 답변 목록
    replies:  { type: [ReplySchema], default: [] },
  },
  { timestamps: true }
)

// 검색 인덱스
// CsSchema.index({ title: 'text', content: 'text', nickname: 'text' })

export default mongoose.models.Cs || mongoose.model('Cs', CsSchema)
