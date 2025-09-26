import mongoose from 'mongoose'

const SiteSettingsSchema = new mongoose.Schema({
    siteName: { type:String, default:'' },
    ceo: { type:String, default:'' },
    bizNo: { type:String, default:'' },
    mailOrderNo: { type:String, default:'' },
    address: { type:String, default:'' },
    tel: { type:String, default:'' },
    email: { type:String, default:'' },
    cpo: { type:String, default:'' },
}, { collection:'site_settings' })


export default mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema)