<template>
    <ClientOnly>
        <div class="main-banner">
            <Swiper :modules="modules" :slides-per-view="1" :pagination="{ clickable: true }" :loop="true"
                :autoplay="{ delay: 5000, disableOnInteraction: false }">
                <SwiperSlide v-for="(slide, i) in images" :key="i">
                    <img :src="slide" :alt="slide" />
                </SwiperSlide>
            </Swiper>
        </div>
    </ClientOnly>

    <div class="intro">
        <div class="inner">
            <div class="img">
                <img :src="intro_img" alt="Nuxt + MongoDB + Vercel + SEO" loading="lazy" />
            </div>
            <div class="txt">
                <div class="top">
                    <h2>본 사이트는 학습 및 포트폴리오 목적의 웹 서비스입니다.</h2>
                    <div>
                        <p>Nuxt3 기반의 SSR 방식으로 데이터 패칭하고, 실제 서비스 운영을 가정해 설계했습니다.</p>
                        <p>MongoDB로 데이터를 관리하며, 서버(API)와 프론트 간 통신구조를 구현했습니다.</p>
                        <p>이미지는 Vercel Blob으로 클라이언트가 직접 업로드 → URL 변환 후 저장합니다.</p>
                        <p>메타 태그(OG/Twitter)를 적용해 기본 SEO를 챙겼고, Vercel에 빌드/배포했습니다.</p>
                    </div>
                </div>
                <div class="bottom">
                    <h2>사용자 경험에 기반한 흐름을 생각하였습니다.</h2>
                    <div>
                        <p>상품탐색부터 장바구니, 결제까지 추후 확장 가능성을 열어놓고 설계했습니다.</p>
                        <p>고객센터를 통해 공지확인과 1:1 문의 등 관리자와의 상호작용이 가능합니다.</p>
                        <p>관리자 페이지를 통해 상품등록/수정이 가능하고 주문 현황, 정보 수정, CS문의를 확인할 수 있습니다.</p>
                        <p>회원가입 시 메일 확인을 통해 중복가입을 방지했고 로그인을 통한 장바구니, 결제 데이터를 유지합니다.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="demo-account">
        <h2>데모 계정 안내</h2>
        <ul class="list">
            <li class="item">
                <i class="fa-solid fa-user-tie"></i>
                <strong>Admin</strong>
                <span>ID: <code>admin</code> / PW: <code>qwe123@@</code></span>
                <button type="button" class="btn" @click="goDemo('admin')">관리자 로그인으로 이동</button>
            </li>
            <li class="item">
                <i class="fa-solid fa-user"></i>
                <strong>User</strong>
                <span>ID: <code>user</code> / PW: <code>qwe123@@</code></span>
                <button type="button" class="btn ghost" @click="goDemo('user')">사용자 로그인으로 이동</button>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Scrollbar, Autoplay } from 'swiper/modules'

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import img1 from '~/assets/images/1.jpg'
import img2 from '~/assets/images/2.jpg'
import img3 from '~/assets/images/3.jpg'
import intro_img from '~/assets/images/intro_img.png'

const images = [img1, img2, img3]
const modules = [Navigation, Pagination, Scrollbar, Autoplay]

const router = useRouter()
function goDemo(role: 'admin' | 'user') {
    const payload =
        role === 'admin'
            ? { id: 'admin', pw: 'qwe123@@' }
            : { id: 'user', pw: 'qwe123@@' }

    // 로그인 페이지에서 읽을 값 저장
    sessionStorage.setItem('demoCreds', JSON.stringify(payload))

    router.push('/login')
}
</script>

<style scoped>
.main-banner :deep(.swiper) {
    width: 100%;
    height: 800px;
}

.main-banner :deep(.swiper-wrapper) {
    height: 100%;
}

.main-banner :deep(.swiper-slide) {
    display: flex;
    align-items: center;
    justify-content: center;
}

.main-banner :deep(.swiper-slide img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.intro {
    margin-top: 100px;
}

.intro .inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
}

.intro .inner .img {
    width: 100%;
    height: 100%;
}

.intro .inner .img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.intro .inner .txt {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding-left: 32px;
}

.demo-account {
    padding: 100px 0;
    background: #fff;
}

.demo-account h2 {
    font-size: 30px;
    text-align: center;
}

.list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    gap: 48px
}

.item {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    padding: 32px 16px 16px;
    border: 1px solid #eee;
    border-radius: 12px;
}

.fa-solid,
.fas {
    font-size: 40px;
}

.btn {
    margin-top: 10px;
    padding: 8px 12px;
    border-radius: 10px;
    background: #111;
    color: #fff;
    cursor: pointer;
}

.btn.ghost {
    background: #fff;
    color: #111;
    border: 1px solid #ddd;
}

code {
    background: #f7f7f8;
    padding: 2px 6px;
    border-radius: 6px;
}
</style>
