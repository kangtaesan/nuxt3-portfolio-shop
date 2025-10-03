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
      title: 'Portfolio',
      htmlAttrs: { lang: 'ko' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Nuxt3 기반 포트폴리오 웹 서비스' },

        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Portfolio' },
        { property: 'og:title', content: 'Portfolio' },
        { property: 'og:description', content: 'Nuxt3 기반 포트폴리오 웹 서비스' },
        { property: 'og:image', content: '/og-default.jpg' }, // public 폴더
        { property: 'og:url', content: 'https://your-domain.com' },

        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Portfolio' },
        { name: 'twitter:description', content: 'Nuxt3 기반 포트폴리오 웹 서비스' },
        { name: 'twitter:image', content: '/og-default.jpg' } // public 폴더
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css'
        }
      ]
    }
  },
  routeRules: {
    // maxAge: 설정시간 동안 db 안찍고 캐시로 응답
    // swr: maxAge 설정시간 지나도 캐시를 즉시 내보내고 뒤에서 갱신
    // API GET만 캐시
    // '/api/products/**': {cache:{maxAge:60, swr: true}},
    // '/api/cs/notice/**': {cache:{maxAge:120, swr: true}},
    // '/api/settings/**': {cache:{maxAge:300, swr: true}},
    // PAGE: ISR(HTML 주기적으로 재생성)
    // '/': {isr: 60}, 
    // '/products': {isr: 60}, 
    // '/products/**': {isr: 60}, 
    // '/details/**': {isr: 60}, 
    // 기본 SSR
    // '/login':          { prerender: false },
    // '/signup':         { prerender: false },
    // '/orders/**':      { prerender: false },
    // '/cart':           { prerender: false },
    // '/mypage':         { prerender: false },
    // '/verify-result':  { prerender: false },
    // '/paycheck':       { prerender: false },
    // '/cs/**':          { prerender: false },
    // '/admin/**':       { prerender: false },
  }
})
