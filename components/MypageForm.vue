<template>
    <div v-if="user" class="mypage-layout">
        <h1>마이페이지</h1>
        <p>{{ user.nickname }}님의 마이페이지입니다.</p>
        <p>{{ user.email }}</p>
    </div>
</template>

<script setup>
import { useAuthStore } from '@/store/auth'
const { user } = useAuthStore()

</script>

<style scoped>
.mypage-layout {
    margin-top: 65px;
}
</style>