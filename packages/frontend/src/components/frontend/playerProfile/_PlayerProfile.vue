<template>
    <div class="PlayerProfile">
        <h1 class="bp-title">Spieler Profil</h1>
    </div>
</template>

<script setup lang="ts">
import { onMounted, inject } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const openPlayerProfile = inject<(name: string) => void>('openPlayerProfile')!;

onMounted(() => {
    let playerName = decodeURIComponent(route.params.PlayerName as string).replaceAll("-", " ");
    setTimeout(() => openPlayerProfile(playerName), 100);
});
</script>
