<template>
    <div class="mb-[40px]">
        <Panel header="Spielverlauf">
            <div class="flex flex-col gap-[12px]">
                <div v-for="(item, i) in displayed" :key="i" class="match-entry">
                    <div class="flex items-center gap-[8px] mb-[6px]">
                        <Tag :value="item.source" severity="secondary" rounded />
                        <span class="text-[12px] text-[--p-text-muted-color]" v-if="item.time">
                            {{ formatDate(item.time) }}, {{ formatTime(item.time) }}
                        </span>
                        <Tag
                            :severity="isWin(item) ? 'success' : 'danger'"
                            :value="isWin(item) ? 'Sieg' : 'Niederlage'"
                            rounded
                            class="ml-auto"
                        />
                    </div>
                    <MatchElement :match="item.match" />
                </div>
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

const formatDate = (ts: number) => new Date(ts).toLocaleDateString('de-DE');
const formatTime = (ts: number) => {
    let d = new Date(ts);
    return d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes() + ' Uhr';
};
</script>

<style scoped>
.match-entry {
    border-bottom: 1px solid var(--p-content-border-color);
    padding-bottom: 12px;
}
.match-entry:last-child {
    border-bottom: none;
    padding-bottom: 0;
}
</style>
