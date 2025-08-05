// JWT - JSON Web Token, 사용자 인증 정보를 암호화하여 클라이언트에 전달하여 인증된 사용자 증명
// npm install jsonwebtoken npm install -D @types/jsonwebtoken
import jwt from 'jsonwebtoken'
// npm i nodemailer npm i --save-dev @types/nodemailer
import nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

// JWT 토큰을 암호화(Sign)하고 검증(verify)할 때 쓰는 비밀 키
const SECRET_KEY = 'nuxt-portfolio-secret-key' // 실제 프로젝트에서는 .env 파일로 관리
const EXPRIES_IN = '7d' // JWT 토큰의 만료 기간 설정, 7d = 7일

export const generateToken = (payload: object) => {
    // jwt.sign(payload, secret, options) -> JWT 토큰 생성 함수
    return jwt.sign(payload, SECRET_KEY, {expiresIn: EXPRIES_IN})
} // expiresIn으로 만료시간을 설정하면 payload의 만료시간(exp)에 자동 삽입됨

export const verifyToken = (token: string) => {
    // jwt.verify(token, secret) -> 클라이언트가 보낸 토큰을 검증, 유효하면 payload 반환
    return jwt.verify(token, SECRET_KEY)
}

// 이메일 인증
export const sendVerificationEmail = async (email: string, token: string) => {
    // .env에 설정된 런타임 설정값 불러오기
    const config = useRuntimeConfig()
  
    // 인증용 링크 생성 (클릭 시 서버로 인증 요청)
    const verificationUrl = `${config.public.baseURL}/verify-result?token=${token}`
  
    const transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,         // SMTP 서버 주소
      port: Number(config.SMTP_PORT), // SSL(465) 또는 TLS(587) 포트
      secure: config.SMTP_SECURE === 'true', // 문자열을 boolean으로 변환
      auth: {
        user: config.SMTP_USER,       // SMTP 발신 계정 ID (예: noreply@yourdomain.com)
        pass: config.SMTP_PASS,       // SMTP 발신 계정 비밀번호 또는 API 키
      },
      family: 4, // IPv4 강제
    } as SMTPTransport.Options)
  
    await transporter.sendMail({
      from: `"Your Service" <${config.SMTP_USER}>`, // 보내는 사람 이름과 주소
      to: email, // 사용자 입력 이메일
      subject: '이메일 인증을 완료해주세요',
      html: `
          <p>안녕하세요, 이메일 인증을 진행해주세요.</p>
          <p>아래 버튼 또는 링크를 클릭하면 인증이 완료됩니다:</p>
          <p style="margin: 20px 0;">
            <a href="${verificationUrl}"
              style="
                display:inline-block;
                padding:10px 20px;
                background:#4CAF50;
                color:#ffffff;
                border-radius:5px;
                text-decoration:none;
                font-weight:bold;
            ">
          이메일 인증하기
          </a>
          </p>
          <p>또는 아래 링크를 복사해서 브라우저에 붙여넣으세요:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      `,
      text: `이메일 인증을 위해 아래 링크를 클릭해주세요: ${verificationUrl}`,
    })
    
  }
  // 이메일 인증번호 전송
  export const sendVerificationEmailCode = async (email: string, code: string) => {
    const config = useRuntimeConfig()
  
    const transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: Number(config.SMTP_PORT),
      secure: config.SMTP_SECURE === 'true',
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    })
  
    await transporter.sendMail({
      from: `"Your Service" <${config.SMTP_USER}>`,
      to: email,
      subject: '인증번호를 확인해주세요',
      html: `
        <p>안녕하세요, 요청하신 인증번호는 다음과 같습니다:</p>
        <h2 style="color:#4CAF50">${code}</h2>
        <p>3분 이내에 입력해주세요.</p>
      `,
      text: `인증번호: ${code} (3분 이내 유효)`,
    })
  }

export const sendVerificationSMS = async (phone: string, code: string) => {
  // 실제 SMS API 연동
  console.log(`[DEBUG] 인증번호 전송: ${code} (to ${phone})`)
}  