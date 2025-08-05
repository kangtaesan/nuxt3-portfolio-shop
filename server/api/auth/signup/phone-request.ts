import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ phone?: string }>(event)
  const { phone } = body

    if (!phone || !phone.trim()) {
      return { statusCode: 400, message: '휴대폰 번호를 입력해주세요.' }
    }

    try {
      // 인증번호 생성 로직 6자리 - 100000 + (0 ~ 899999) → 100000 ~ 999999
      const code = Math.floor(100000 + Math.random() * 900000).toString()

      // 1. globalThis를 any로 캐스팅, Node.js 환경에서 전역 변수로 사용되는 객체
      const gt = globalThis as any

      // 2. phoneCodes가 없으면 초기화
      gt.phoneCodes = gt.phoneCodes || {}

      // 3. 값 할당
      gt.phoneCodes[phone] = {
        code,
        expiresAt: Date.now() + 5 * 60 * 1000 // 5분 후 만료
      } // "01012345678": "483920", phone: code 형태로 저장

      // 4.현재는 SMS 발송 대신 콘솔 출력
      console.log(`[DEBUG] 인증번호 발송: ${code} (to ${phone})`)

      return {
        statusCode: 200,
        message: '휴대폰 인증번호가 전송되었습니다.',
        data: { code },
      }
    } catch (error) {
      return {
        statusCode: 500,
        message: '휴대폰 인증 요청 중 오류가 발생했습니다.',
      }
    }
})