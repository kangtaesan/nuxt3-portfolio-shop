import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    //mongoose, _id 자동생성
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, /* required: true */ },
    description: { type: String },
    stock: { type: Number, default: 0 }, // 재고
    category: { type: String },
    isSoldOut: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    detailImages: { type: [String], default: [] },
    optionStocks: {
        type: [
          {
            label: { type: String, required: true, trim: true },
            qty:   { type: Number, required: true, min: 0 },
          }
        ],
        default: [],
      },
})
productSchema.index({ createdAt: -1 })   
productSchema.index({ category: 1, createdAt: -1 }) 

// Mongoose 핫 리로딩 시 에러 방지 구문 - Nuxt3 개발 시 mongoose.model()이 여러 번 호출되면 에러
export default mongoose.models.Product || mongoose.model('Product', productSchema)
// 이미 생성된 모델이 있으면 그걸 재사용하고 || 없으면 새로 만든다.