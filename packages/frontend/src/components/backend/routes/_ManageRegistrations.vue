<template>
    <div class="Manage">
        <h1 class="bp-title" style="position: inherit; margin-bottom: 40px;">Anmeldungen 2026</h1>
        <div style="width: 100%; max-width: 900px;">
            <RegistrationsList :show-dates="true" />
        </div>
    </div>
</template>

<script setup lang="ts">
import RegistrationsList from '@/components/shared/RegistrationsList.vue';
</script>

<style scoped>
.Manage {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 80px;
}
</style>
