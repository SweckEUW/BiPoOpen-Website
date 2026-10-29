<template>
    <div class="pp-section-title">Spielverlauf</div>

    <div class="mb-[40px]">
        <Panel :pt="{ header: { class: 'p-2' } }">
            <div class="flex flex-col gap-[12px]">
                <MatchElement v-for="(item, i) in displayed" :key="i" :match="item.match" :chipLabel="item.source" showChip showDate class="match-entry">
                    <template #meta>
                        <Tag
                            :severity="isWin(item) ? 'success' : 'danger'"
                            :value="isWin(item) ? 'Sieg' : 'Niederlage'"
                            rounded
                            class="ml-auto"
                        />
                    </template>
                </MatchElement>
            </div>
            <Button
                v-if="matchHistory.length > limit"
                :label="'Mehr anzeigen (' + (matchHistory.length - limit) + ' weitere)'"
                severity="secondary" outlined class="w-full mt-[10px]"
                @click="limit += 20"
            />
        </Panel>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';
import Panel from 'primevue/panel';
import Tag from 'primevue/tag';
import Button from 'primevue/button';

const props = defineProps<{
    matchHistory: MatchHistoryEntry[];
    playerName: string;
    leagueTeam: string | null;
}>();

const limit = ref(20);

const displayed = computed(() => props.matchHistory.slice(0, limit.value));

const isWin = (entry: MatchHistoryEntry) => {
    let lo = props.playerName.toLowerCase();
    let leagueLo = props.leagueTeam ? props.leagueTeam.toLowerCase() : null;
    let t1 = entry.match.team1.players.reduce((a, p) => a + p.score, 0);
    let t2 = entry.match.team2.players.reduce((a, p) => a + p.score, 0);
    let isTeam1 = entry.match.team1.players.some(p => {
        let n = p.name.toLowerCase();
        return n === lo || (leagueLo && n === leagueLo);
    });
    let isTeam2 = entry.match.team2.players.some(p => {
        let n = p.name.toLowerCase();
        return n === lo || (leagueLo && n === leagueLo);
    });
    if (isTeam1) return t1 > t2;
    if (isTeam2) return t2 > t1;
    return false;
};

</script>

<style scoped>
.pp-section-title {
    font-size: 20px;
    font-weight: bold;
    color: var(--p-primary-color);
    margin-bottom: 12px;
}
.flex > .match-entry {
    margin-bottom: 0;
}
</style>
