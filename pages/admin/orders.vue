<template>
    <OrderForm></OrderForm>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })
import OrderForm from '~/components/admin/OrderForm.vue';
</script>

<style scoped></style>