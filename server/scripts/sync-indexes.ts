// server/scripts/sync-indexes.ts
// 배포 시 인덱스 명시적으로 사용
import connectDB from '@/server/plugins/mongoose.server'
import Product from '@/server/models/ProductModel'
import Order from '@/server/models/OrderModel'
import Cs from '@/server/models/CsModel'
import CsNotice from '@/server/models/CsNoticeModel'

await connectDB()
await Promise.all([
  Product.syncIndexes(),
  Order.syncIndexes(),
  Cs.syncIndexes(),
  CsNotice.syncIndexes(),
])
console.log('✅ indexes synced')
process.exit(0)
