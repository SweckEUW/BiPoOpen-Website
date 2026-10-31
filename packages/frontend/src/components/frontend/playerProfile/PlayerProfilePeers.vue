<template>
    <section v-if="rows.length" class="pp-section">
        <div class="pp-section-head">
            <h2 class="pp-section-title">{{ isDouble ? 'Partner & Gegner im Doppel' : 'Gegner im Einzel' }}</h2>
        </div>

        <div class="pp-card pp-peers">
            <component
                :is="row.players.length === 1 ? 'button' : 'div'"
                v-for="row in rows"
                :key="`${row.role}-${row.name}`"
                :type="row.players.length === 1 ? 'button' : undefined"
                class="pp-peer"
                :class="{ 'is-clickable': row.players.length === 1 }"
                @click="row.players.length === 1 && openPlayerProfile?.(row.players[0])"
            >
                <Avatar :name="row.players[0]" class="pp-peer-avatar"/>
                <div class="pp-peer-main">
                    <div class="pp-peer-name">
                        <template v-if="row.players.length === 1">{{ row.name }}</template>
                        <template v-else>
                            <template v-for="(player, index) in row.players" :key="player">
                                <button type="button" class="pp-peer-link" @click="openPlayerProfile?.(player)">{{ player }}</button>
                                <template v-if="index < row.players.length - 1"> &amp; </template>
                            </template>
                        </template>
                    </div>
                    <div class="pp-peer-meta">
                        <b :class="{ 'pp-loss': row.role === 'Gegner' }">{{ row.role }}</b> · {{ row.matches }} Spiele
                    </div>
                </div>
                <div class="pp-peer-score">
                    <span class="pp-win">{{ row.wins }}</span> : <span class="pp-loss">{{ row.losses }}</span>
                </div>
            </component>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import Avatar from '@/components/shared/Avatar.vue';

const props = defineProps<{
    partners: PartnerData[];
    rivals: RivalData[];
    isDouble: boolean;
}>();

const openPlayerProfile = inject<(name: string) => void>('openPlayerProfile');

// Je die 3 haeufigsten mit mehr als 3 gemeinsamen Spielen
const MAX_PER_ROLE = 3;
const MIN_MATCHES = 3;

const rows = computed(() => {
    const toRows = (entries: PartnerData[], role: 'Partner' | 'Gegner') => entries
        .filter(entry => entry.matches > MIN_MATCHES)
        .slice(0, MAX_PER_ROLE)
        .map(entry => ({
            ...entry,
            role,
            players: entry.name.split(' & ').map(player => player.trim()).filter(Boolean),
        }));

    return [...toRows(props.partners, 'Partner'), ...toRows(props.rivals, 'Gegner')];
});
</script>

<style scoped>
.pp-peers {
    overflow: hidden;
}
.pp-peer {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 11px 14px;
    border: none;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    -webkit-tap-highlight-color: transparent;
}
.pp-peer + .pp-peer {
    border-top: 1px solid #eef0f2;
}
.pp-peer.is-clickable {
    cursor: pointer;
}
.pp-peer.is-clickable:hover {
    background: #fafbfc;
}
.pp-peer-avatar {
    --avatar-background: #e9ebee;
    --avatar-color: #3a3f47;
    flex-shrink: 0;
    font-size: 13px !important;
    font-weight: 700;
}
.pp-peer-main {
    flex: 1;
    min-width: 0;
}
.pp-peer-name {
    font-size: 14px;
    font-weight: 700;
    overflow-wrap: anywhere;
}
.pp-peer-link {
    padding: 0;
    border: none;
    background: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
}
.pp-peer-link:hover {
    text-decoration: underline;
}
.pp-peer-meta {
    margin-top: 1px;
    font-size: 12px;
    color: #6b717b;

    b {
        color: #1d1f23;
    }
    b.pp-loss {
        color: #d64545;
    }
}
.pp-peer-score {
    flex-shrink: 0;
    font-size: 14px;
    font-weight: 800;
    color: #a0a5ad;
}
</style>
