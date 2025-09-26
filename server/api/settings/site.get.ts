import connectDB from '@/server/plugins/mongoose.server'
import SiteSettings from '@/server/models/SiteSettings'

export default defineEventHandler(async () => {
  await connectDB()
  const doc = await SiteSettings.findOne().lean()
  return doc || {}
})