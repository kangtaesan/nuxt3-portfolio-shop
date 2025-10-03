import mongoose from 'mongoose'

const { Schema } = mongoose

const CsNoticeSchema = new Schema({
  title:   { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
}, { timestamps: true }) // createdAt, updatedAt

// 최신순 정렬에 유리
CsNoticeSchema.index({ createdAt: -1 })

export default mongoose.models.CsNotice || mongoose.model('CsNotice', CsNoticeSchema)
