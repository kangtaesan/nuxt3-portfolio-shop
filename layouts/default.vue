<!-- layouts/default.vue -->
<template>
    <div>
        <Header></Header>
        <main>
            <slot></slot> <!-- 여기에 페이지별 content가 들어옴 -->
        </main>
    </div>
</template>

<script setup lang="ts">
// @components: Header.vue
</script>

<style></style>