<template>
    <MypageForm></MypageForm>
</template>

<script setup lang="ts">
// @components : MypageForm.vue

// middleware로 로그인 상태가 아니면 자동 리다이렉트
definePageMeta({
    middleware: 'auth'
})
</script>

<style scoped></style>