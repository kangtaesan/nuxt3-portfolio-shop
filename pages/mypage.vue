<template>
    <div class="container">
        <MypageForm></MypageForm>

        <nav class="tabs">
            <button class="tab" :class="{ active: tab === 'orders' }" @click="tab = 'orders'"
                type="button">주문내역</button>
            <button class="tab" :class="{ active: tab === 'profile' }" @click="tab = 'profile'"
                type="button">개인정보</button>
        </nav>
        <section v-show="tab === 'orders'">
            <MyOrderList></MyOrderList>
        </section>
        <section v-show="tab === 'profile'">
            <MyInfo></MyInfo>
        </section>
    </div>
</template>

<script setup lang="ts">
import MypageForm from '~/components/mypage/MypageForm.vue';
import MyOrderList from '~/components/mypage/MyOrderList.vue';
import MyInfo from '~/components/mypage/MyInfo.vue';

// middleware로 로그인 상태가 아니면 자동 리다이렉트
definePageMeta({
    middleware: 'auth'
})

const tab = ref<'orders' | 'profile'>('orders')
</script>

<style scoped>
.container {
    max-width: 960px;
    margin: 70px auto 40px;
    padding: 0 16px;
}

.tabs {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin: 12px 0 16px;
}

.tab {
    padding: 10px 16px;
    border: 1px solid #e5e7eb;
    background: #fff;
    border-radius: 999px;
    cursor: pointer;
    font-weight: 600;
}

.tab.active {
    background: #111827;
    color: #fff;
    border-color: #111827;
}
</style>