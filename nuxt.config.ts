// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@pinia/nuxt'], // npm install @pinia/nuxt
  runtimeConfig: {
    // 서버 전용 환경변수 (비공개)
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    // 클라이언트에서 접근 가능한 변수 (공개 가능)
    public: {
      baseURL: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      
      // Vercel Blob Storage 클라이언트 접근
      blobReadOnlyToken: process.env.BLOB_READ_ONLY_TOKEN 
    },
    // 서버 전용 Vercel Blob Storage
    blobToken: process.env.BLOB_READ_WRITE_TOKEN, 
  },
  plugins: ['~/composables/cookieAuth.client.ts'],
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css'
        }
      ]
    }
  }
})