<template>
    <div class="pp-section-title">Mitspieler & Gegner</div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-[20px] mb-[10px]">
        <Panel v-if="partners.length > 0" header="Häufigste Partner (2v2)">
            <div class="flex flex-col gap-[10px]">
                <PlayerPeerCard
                    v-for="partner in partners"
                    :key="partner.name"
                    :name="partner.name"
                    :matches="partner.matches"
                    :wins="partner.wins"
                    :losses="partner.losses"
                    :clickable="true"
                    subtitle="zusammen"
                    @open="$emit('openPlayer', $event)"
                />
            </div>
        </Panel>

        <Panel v-if="rivals.length > 0" header="Top Gegner">
            <div class="flex flex-col gap-[10px]">
                <PlayerPeerCard
                    v-for="rival in rivals"
                    :key="rival.name"
                    :name="rival.name"
                    :matches="rival.matches"
                    :wins="rival.wins"
                    :losses="rival.losses"
                />
            </div>
        </Panel>
    </div>
</template>

<script setup lang="ts">
import Panel from 'primevue/panel';
import PlayerPeerCard from './PlayerPeerCard.vue';

defineProps<{
    partners: PartnerData[];
    rivals: RivalData[];
}>();

defineEmits<{
    openPlayer: [name: string];
}>();
</script>

<style scoped>
.pp-section-title {
    font-size: 20px;
    font-weight: bold;
    color: var(--p-primary-color);
    margin-bottom: 12px;
}
</style>
