import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name:      { type: String, required: true },
    price:     { type: Number, required: true },
    imageUrl:  { type: String },
    optionName:{ type: String },
    optionExtraPrice: { type: Number, default: 0 },
    quantity:  { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema({
  userId:   { type: String, required: true, unique: true, index: true },
  items:    { type: [cartItemSchema], default: [] },
  updatedAt:{ type: Date, default: Date.now },
});

cartSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Cart || mongoose.model('Cart', cartSchema);