<template>
    <div>
        <CreateProductsForm></CreateProductsForm>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })
import CreateProductsForm from '@/components/admin/CreateProductsForm.vue'

</script>

<style lang="scss" scoped></style>