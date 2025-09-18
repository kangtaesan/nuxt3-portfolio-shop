import mongoose from 'mongoose'

const CartItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true }, // 기본가
    imageUrl: String,
    optionName: String,
    optionExtraPrice: { type: Number, default: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true }, // 서버 계산 값
  }, { _id: false });
  
  const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [CartItemSchema], required: true },
    productsTotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true, default: 0 },
    orderTotal: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'shipping', 'done' ,'canceled', 'failed'], default: 'pending' },

    // 주문자 정보
    ordererName:   { type: String, required: true },
    ordererPhone:  { type: String, required: true },
    shippingAddr:  { type: String, required: true },
    note:          { type: String, default: '' },
  }, { timestamps: true });
  
  export default mongoose.models.Order || mongoose.model('Order', OrderSchema)