<template>
    <footer class="ft">
        <div class="ft-left">
            <div class="ft-links">
                <nav class="links">
                    <NuxtLink to="/cs" class="link">고객센터</NuxtLink>
                    <NuxtLink class="link">이용약관</NuxtLink>
                    <NuxtLink class="link">개인정보처리방침</NuxtLink>
                    <NuxtLink class="link">사업자 정보 확인</NuxtLink>
                </nav>
            </div>

            <div class="ft-info" v-if="s">
                <div class="row">
                    <strong class="brand">{{ s.siteName }}</strong>
                    <span class="sep" aria-hidden="true">|</span>
                    <span>대표자: {{ s.ceo }}</span>
                    <span class="sep" aria-hidden="true">|</span>
                    <span>사업자등록번호: {{ s.bizNo }}</span>
                    <span class="sep" aria-hidden="true">|</span>
                    <span>통신판매업: {{ s.mailOrderNo }}</span>
                    <span class="sep" aria-hidden="true">|</span>
                </div>
                <div class="row">
                    <span>{{ s.address }}</span>
                    <span class="sep" aria-hidden="true">|</span>
                    <span>{{ s.tel }}</span>
                    <span class="sep" aria-hidden="true">|</span>
                    <span>{{ s.email }}</span>
                    <span class="sep" aria-hidden="true">|</span>
                    <span>개인정보관리책임자: {{ s.cpo }}</span>
                </div>
            </div>
        </div>
        <div class="ft-right">
            <div class="ft-sns">
                <i class="fa-brands fa-instagram"></i>
                <i class="fa-brands fa-youtube"></i>
            </div>
            <div class="ft-copy">
                © {{ new Date().getFullYear() }} {{ s?.siteName || 'Company' }}. All rights reserved.
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
import type { SiteSettings } from '@/types/settings'


const API = '/api/settings/site' as const

const { data } = await useAsyncData<SiteSettings>('site-setting', () =>
    $fetch<SiteSettings>(API)
)

const s = computed(() => data.value)

</script>

<style scoped>
/* ===== Footer (좌/우 2컬럼) ===== */
.ft {
    margin-top: auto;
    /* 레이아웃이 flex-column일 때 바닥으로 */
    border-top: 1px solid #eee;
    background: #fafafa;
    padding: 20px 16px;
    color: #444;
    font-size: 14px;
    line-height: 1.6;

    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
}

/* 좌측 영역 */
.ft-left {
    flex: 1 1 640px;
    /* 넓게 가져가고 필요시 줄어듦 */
    min-width: 280px;
    display: grid;
    gap: 12px;
}


.links {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
}

.link {
    color: #111;
    text-decoration: none;
}

.link:hover {
    text-decoration: underline;
}

/* 회사 정보 라인 */
.ft-info {
    display: grid;
    gap: 4px;
}

.ft-info .row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
}

.ft-info .brand {
    font-weight: 700;
}

.ft-info .sep {
    color: #bbb;
    margin: 0 2px;
}

/* 우측 영역 */
.ft-right {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    /* 오른쪽 정렬 */
    gap: 20px;
    min-width: 180px;
}

.ft-sns {
    display: flex;
    gap: 12px;
    font-size: 25px;
}

.ft-sns i {
    cursor: pointer;
    opacity: .85;
    transition: transform .15s ease, opacity .15s ease;
}

.ft-sns i:hover {
    transform: translateY(-1px);
    opacity: 1;
}

.ft-copy {
    color: #777;
    font-size: 13px;
    text-align: right;
}

/* 모바일/태블릿: 세로 스택 + 중앙정렬 */
@media (max-width: 768px) {
    .ft {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
    }

    .ft-right {
        align-items: center;
        text-align: center;
    }

    .ft-info .sep {
        display: none;
    }

    /* 좁은 화면에선 구분선 제거 */
}
</style>