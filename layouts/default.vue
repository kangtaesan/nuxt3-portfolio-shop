<!-- layouts/default.vue -->
<template>
    <div class="page">
        <Header></Header>
        <main class="page-main">
            <slot></slot> <!-- 여기에 페이지별 content가 들어옴 -->
        </main>
        <Footer></Footer>
    </div>
</template>

<script setup lang="ts">
import Header from '~/components/Header.vue';
import Footer from '~/components/Footer.vue';
</script>

<style>
html,
body {
    height: 100%;
    margin: 0;
}

.page {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
}

.page-main {
    /* flex-grow 1 flex-shrink 0 flex-basis auto */
    flex: 1 0 auto;
    padding: 62px 0 0;
}

.page>footer,
.page>.footer {
    margin-top: auto;
    border-top: 1px solid #eee;
    background: #fafafa;
    padding: 16px 0;
}
</style>