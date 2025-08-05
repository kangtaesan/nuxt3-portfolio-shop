// server/models/UserModel.ts
import mongoose from 'mongoose'

// validator, 유효성 검사는 스키마에 적용
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, maxlength: 30,},
  password: { type: String, required: true, trim: true, minlength: 6, maxlength: 100,},
  nickname: { type: String, trim: true, maxlength: 20,},
  email: { type: String, required: true, unique: true, trim: true, },
  phone: { type: String, required: true, trim: true, /* unique: true, */ },
}, { timestamps: true })
// timestamps는 createdAt, updatedAt을 자동으로 생성해줌

// Mongoose 핫 리로딩 시 에러 방지 구문 - Nuxt3 개발 시 mongoose.model()이 여러 번 호출되면 에러
export default mongoose.models.User || mongoose.model('User', userSchema)
// 이미 생성된 모델이 있으면 그걸 재사용하고 || 없으면 새로 만든다.

// mongoose.models.[name] -> 모델을 새로 정의, name은 mongoose 내부 key로 저장
// mongoose.model('name', Schema) -> 정의된 모델을 캐시에서 꺼냄 