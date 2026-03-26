<template>
    <div v-if="hasVisiblePeers">
        <div class="pp-section-title">Mitspieler & Gegner</div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-[20px] mb-[10px]">
            <Panel v-if="visiblePartners.length > 0" header="Häufigste Partner (2v2)">
                <div class="flex flex-col gap-[10px]">
                    <PlayerPeerCard
                        v-for="partner in visiblePartners"
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

            <Panel v-if="visibleRivals.length > 0" header="Top Gegner">
                <div class="flex flex-col gap-[10px]">
                    <Card v-for="rival in visibleRivalsWithPlayers" :key="rival.name">
                        <template #content>
                            <div class="flex items-center gap-[10px]">
                                <div class="flex -space-x-2">
                                    <PlayerProfileAvatar
                                        v-for="player in rival.players"
                                        :key="player"
                                        :name="player"
                                        class="pp-rival-avatar"
                                    />
                                </div>

                                <div class="flex-1 min-w-0">
                                    <div class="font-bold text-[14px] break-words">
                                        <template v-for="(player, index) in rival.players" :key="player">
                                            <span
                                                class="text-[--p-primary-color] cursor-pointer hover:underline"
                                                @click="$emit('openPlayer', player)"
                                            >
                                                {{ player }}
                                            </span>
                                            <span v-if="index < rival.players.length - 1"> &amp; </span>
                                        </template>
                                    </div>
                                    <div class="text-[12px] text-[--p-text-muted-color]">{{ rival.matches }} Spiele</div>
                                </div>

                                <div class="flex gap-[4px]">
                                    <Tag severity="success" :value="rival.wins + 'S'" rounded />
                                    <Tag severity="danger" :value="rival.losses + 'N'" rounded />
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
            </Panel>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Tag from 'primevue/tag';
import Card from 'primevue/card';
import Panel from 'primevue/panel';
import PlayerPeerCard from './PlayerPeerCard.vue';
import PlayerProfileAvatar from './PlayerProfileAvatar.vue';

const props = defineProps<{
    partners: PartnerData[];
    rivals: RivalData[];
}>();

defineEmits<{
    openPlayer: [name: string];
}>();

const visiblePartners = computed(() =>
    props.partners
        .filter(partner => partner.matches > 3)
        .sort((a, b) => b.matches - a.matches),
);

const visibleRivals = computed(() =>
    props.rivals
        .filter(rival => rival.matches > 3)
        .sort((a, b) => b.matches - a.matches),
);

const visibleRivalsWithPlayers = computed(() =>
    visibleRivals.value.map(rival => ({
        ...rival,
        players: rival.name.split(' & ').map(player => player.trim()).filter(Boolean),
    })),
);

const hasVisiblePeers = computed(() => visiblePartners.value.length > 0 || visibleRivals.value.length > 0);
</script>

<style scoped>
.pp-section-title {
    font-size: 20px;
    font-weight: bold;
    color: var(--p-primary-color);
    margin-bottom: 12px;
}

.pp-rival-avatar {
    border: 2px solid var(--p-surface-0);
}
</style>
