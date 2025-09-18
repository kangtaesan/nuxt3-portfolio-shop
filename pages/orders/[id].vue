<template>
    <div class="done">
        <h1>주문 완료</h1>
        <p>주문번호: <b>{{ id }}</b></p>
        <NuxtLink to="/">메인으로</NuxtLink>
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const id = computed(() => String(route.params.id))
</script>

<style scoped>
.done {
    max-width: 720px;
    margin: 200px auto;
    padding: 0 12px;
}
</style>