// server/models/VerificationModel.ts
import mongoose from 'mongoose'

const verificationSchema = new mongoose.Schema({
  contact: { type: String, required: true },
  code: { type: String, required: true },
  expireAt: { type: Date, required: true },
})

verificationSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.Verification || mongoose.model('Verification', verificationSchema)