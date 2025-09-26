<template>
    <div>
        <AccountForm></AccountForm>
    </div>
</template>

<script setup lang="ts">
import AccountForm from '~/components/admin/AccountForm.vue';
definePageMeta({ middleware: 'admin', layout: 'admin' })
</script>

<style scoped></style>