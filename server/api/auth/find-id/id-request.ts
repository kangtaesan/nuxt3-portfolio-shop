import { defineEventHandler, readBody } from 'h3'
import UserModel from '~/server/models/Usermodel'
import VerificationModel from '~/server/models/VerificationModel'
import { sendVerificationSMS, sendVerificationEmailCode } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
    const body = await readBody<{ email?: string; phone?: string }>(event)
    const { email, phone } = body

    // 1. 이메일/휴대폰 확인
    if (!email && !phone) {
        return { statusCode: 400, message: '이메일 또는 휴대폰을 입력해주세요.' }
    }

    // 2. 사용자 조회 ($or 조건 동적 생성)
    const conditions = []
    if (email) conditions.push({ email })
    if (phone) conditions.push({ phone })
    // mongoDB 메서드 findOne = 조건 만족하는 문서 찾기
    // mongoDB 연산자 $or() = 여러 조건 중 하나라도 맞으면 결과 반환
    const user = await UserModel.findOne({ $or: conditions })
    if (!user) {
        return { statusCode: 404, message: '등록된 사용자가 없습니다.' }
    }

    // 3. 인증번호 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // 4. DB 저장
    await VerificationModel.create({
        contact: email || phone,
        code,
        expireAt: new Date(Date.now() + 3 * 60 * 1000)
    })

    // 5. 발송
    if (email) {
        await sendVerificationEmailCode(email, code)
    } else if (phone) {
        await sendVerificationSMS(phone, code) // SMS 발송 로직
    }

    return { statusCode: 200, message: '인증번호가 전송되었습니다.'}
})