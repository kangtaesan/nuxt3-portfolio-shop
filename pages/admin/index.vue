<template>
    <div></div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
navigateTo('/admin/products', { replace: true })
</script>

<style scoped></style>