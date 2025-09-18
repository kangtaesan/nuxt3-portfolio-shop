<template>
    <div v-if="user" class="mypage-layout">
        <h1 class="title">마이페이지</h1>
        <p class="sub-title"><strong>{{ user.nickname }}</strong> 님의 마이페이지입니다.</p>
    </div>
</template>

<script setup>
import { useAuthStore } from '@/store/auth'
const { user } = useAuthStore()

</script>

<style scoped>
.mypage-layout {
    margin-top: 65px;
    padding: 8px 0;
    text-align: center;
    margin-bottom: 14px;
}

.title {
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -0.2px;
    margin: 0 0 6px;
}

.sub-title {
    color: #4b5563;
    font-size: 15px;
    margin: 0;
}
</style>