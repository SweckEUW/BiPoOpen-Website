<template>
    <Drawer v-model:visible="drawerVisible" position="bottom" class="!h-[90%] rounded-xs mobile-sheet" :blockScroll="true" :showCloseIcon="false" style="color: var(--main-color)" @hide="router.back()">

        <template #header>
            <!-- Loading -->
            <div v-if="isLoading" class="w-full flex justify-center">
                <ProgressSpinner strokeWidth="3" style="width: 40px; height: 40px;" />
            </div>
            <!-- Profile header -->
            <div v-else-if="profileData" class="w-full flex justify-content-center">
                <div class="flex flex-column align-items-center gap-[6px]">
                    <Avatar :label="profileData.name.charAt(0)" size="xlarge" shape="circle" class="mb-[4px]" />
                    <div class="text-[24px] font-bold text-[--p-primary-color]">{{ profileData.name }}</div>
                    <Tag v-if="profileData.leagueTeam" severity="info" :value="'Liga: ' + profileData.leagueTeam" rounded />
                    <div class="flex gap-[12px] mt-[4px]">
                        <Tag severity="success" :value="profileData.totalWins + ' Siege'" rounded />
                        <Tag severity="danger" :value="profileData.totalLosses + ' Niederlagen'" rounded />
                    </div>
                </div>
            </div>
        </template>

        <div v-if="!isLoading && profileData">
            <div class="grid grid-cols-2 lg:grid-cols-5 gap-[12px] mb-[10px]">
                <Card class="text-center">
                    <template #content>
                        <Knob :modelValue="profileData.winrate" :size="100" readonly :strokeWidth="8" valueTemplate="{value}%" />
                        <div class="text-[13px] text-[--p-text-muted-color] mt-[4px]">Siegquote</div>
                        <div v-if="profileData.trends.winrateTrend !== null" class="flex items-center justify-center gap-[4px] mt-[6px]">
                            <i :class="profileData.trends.winrateTrend >= 0 ? 'pi pi-arrow-up text-green-500' : 'pi pi-arrow-down text-red-500'" style="font-size: 1rem"></i>
                            <Tag :severity="profileData.trends.winrateTrend >= 0 ? 'success' : 'danger'"
                                :value="(profileData.trends.winrateTrend >= 0 ? '+' : '') + profileData.trends.winrateTrend + '%'" rounded />
                        </div>
                    </template>
                </Card>

                <Card class="text-center">
                    <template #content>
                        <div class="text-[28px] font-bold text-[--p-primary-color]">{{ profileData.averageHits }}</div>
                        <div class="text-[13px] text-[--p-text-muted-color] mt-[4px]">Treffer / Spiel</div>
                        <div v-if="profileData.trends.averageHitsTrend !== null" class="flex items-center justify-center gap-[4px] mt-[6px]">
                            <i :class="profileData.trends.averageHitsTrend >= 0 ? 'pi pi-arrow-up text-green-500' : 'pi pi-arrow-down text-red-500'" style="font-size: 1rem"></i>
                            <Tag :severity="profileData.trends.averageHitsTrend >= 0 ? 'success' : 'danger'"
                                :value="(profileData.trends.averageHitsTrend >= 0 ? '+' : '') + profileData.trends.averageHitsTrend" rounded />
                        </div>
                    </template>
                </Card>

                <Card class="text-center">
                    <template #content>
                        <div class="text-[28px] font-bold text-[--p-primary-color]">{{ profileData.totalMatches }}</div>
                        <div class="text-[13px] text-[--p-text-muted-color] mt-[4px]">Spiele</div>
                    </template>
                </Card>

                <Card class="text-center">
                    <template #content>
                        <div class="text-[28px] font-bold text-[--p-primary-color]">{{ profileData.totalHits }}</div>
                        <div class="text-[13px] text-[--p-text-muted-color] mt-[4px]">Treffer gesamt</div>
                    </template>
                </Card>

                <Card class="text-center col-span-2 lg:col-span-1">
                    <template #content>
                        <div class="text-[28px] font-bold text-[--p-primary-color]">{{ profileData.currentWinStreak }}</div>
                        <div class="text-[13px] text-[--p-text-muted-color] mt-[4px]">Win Streak</div>
                        <Badge :value="'Best: ' + profileData.bestWinStreak" severity="info" class="mt-[6px]" />
                    </template>
                </Card>
            </div>

            <!-- Win/Loss MeterGroup -->
            <Card class="mb-[10px]">
                <template #title><span class="text-[18px]">Siege / Niederlagen</span></template>
                <template #content>
                    <MeterGroup :value="winLossMeterValues" />
                </template>
            </Card>

            <Divider />

            <!-- Recent Form -->
            <div v-if="profileData.recentForm.length > 0" class="mb-[30px]">
                <Panel header="Aktuelle Form" toggleable>
                    <div class="text-[13px] text-[--p-text-muted-color] text-center mb-[10px]">
                        Neuestes Spiel ← → Ältestes Spiel
                    </div>
                    <div class="flex items-center justify-center gap-[6px] flex-wrap">
                        <i :class="profileData.recentForm[0] === 'W' ? 'pi pi-arrow-up text-green-500' : 'pi pi-arrow-down text-red-500'" style="font-size: 1.1rem"></i>
                        <Chip v-for="(result, index) in profileData.recentForm" :key="index"
                            :label="result === 'W' ? 'S' : 'N'"
                            :class="result === 'W' ? 'pp-chip-win' : 'pp-chip-loss'"
                        />
                        <span class="text-[12px] text-[--p-text-muted-color]">→</span>
                    </div>
                </Panel>
            </div>

            <!-- Wurfanalyse -->
            <div v-if="profileData.turnAnalysis.total > 0" class="mb-[30px]">
                <Panel header="Wurfanalyse" toggleable>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-[20px]">
                        <!-- Pie Chart -->
                        <div>
                            <div class="text-[16px] font-bold text-center mb-[10px] text-[--p-primary-color]">Wurfverteilung</div>
                            <Chart type="doughnut" :data="turnChartData" :options="turnChartOptions" />
                        </div>
                        <!-- Heatmap -->
                        <div>
                            <div class="text-[16px] font-bold text-center mb-[10px] text-[--p-primary-color]">Cup Heatmap</div>
                            <div class="text-[12px] text-[--p-text-muted-color] text-center mb-[8px]">Hotspots: Häufig getroffene Becher</div>
                            <svg viewBox="0 0 300 260" class="w-full max-w-[300px] mx-auto">
                                <!-- Row 4 (back, cups 0-3) -->
                                <circle v-for="i in 4" :key="'r4-'+i" :cx="75 + (i-1) * 50" cy="40" r="22"
                                    :fill="cupColor(i-1)" :opacity="cupOpacity(i-1)" stroke="#333" stroke-width="1.5" />
                                <text v-for="i in 4" :key="'t4-'+i" :x="75 + (i-1) * 50" y="45"
                                    text-anchor="middle" font-size="12" fill="#333" font-weight="bold">{{ profileData.cupHeatmap[i-1] }}</text>
                                <!-- Row 3 (cups 4-6) -->
                                <circle v-for="i in 3" :key="'r3-'+i" :cx="100 + (i-1) * 50" cy="100" r="22"
                                    :fill="cupColor(i+3)" :opacity="cupOpacity(i+3)" stroke="#333" stroke-width="1.5" />
                                <text v-for="i in 3" :key="'t3-'+i" :x="100 + (i-1) * 50" y="105"
                                    text-anchor="middle" font-size="12" fill="#333" font-weight="bold">{{ profileData.cupHeatmap[i+3] }}</text>
                                <!-- Row 2 (cups 7-8) -->
                                <circle v-for="i in 2" :key="'r2-'+i" :cx="125 + (i-1) * 50" cy="160" r="22"
                                    :fill="cupColor(i+6)" :opacity="cupOpacity(i+6)" stroke="#333" stroke-width="1.5" />
                                <text v-for="i in 2" :key="'t2-'+i" :x="125 + (i-1) * 50" y="165"
                                    text-anchor="middle" font-size="12" fill="#333" font-weight="bold">{{ profileData.cupHeatmap[i+6] }}</text>
                                <!-- Row 1 (cup 9, front) -->
                                <circle cx="150" cy="220" r="22"
                                    :fill="cupColor(9)" :opacity="cupOpacity(9)" stroke="#333" stroke-width="1.5" />
                                <text x="150" y="225" text-anchor="middle" font-size="12" fill="#333" font-weight="bold">{{ profileData.cupHeatmap[9] }}</text>
                            </svg>
                            <div class="flex justify-center gap-[8px] mt-[8px]">
                                <div class="flex items-center gap-[4px] text-[12px]"><span class="inline-block w-[12px] h-[12px] rounded-full" style="background: #d3f7ff"></span>Wenig</div>
                                <div class="flex items-center gap-[4px] text-[12px]"><span class="inline-block w-[12px] h-[12px] rounded-full" style="background: #EA5160"></span>Hotspot</div>
                            </div>
                        </div>
                    </div>
                </Panel>
            </div>

            <!-- Weitere Statistiken -->
            <div class="mb-[30px]">
                <Panel header="Weitere Statistiken" toggleable>
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-[12px]">
                        <Card v-if="profileData.extraStats.fastestWinMinutes" class="text-center">
                            <template #content>
                                <div class="text-[24px] font-bold text-[--p-primary-color]">{{ profileData.extraStats.fastestWinMinutes }} min</div>
                                <div class="text-[12px] text-[--p-text-muted-color]">Schnellster Sieg</div>
                            </template>
                        </Card>
                        <Card class="text-center">
                            <template #content>
                                <div class="text-[24px] font-bold text-[--p-primary-color]">{{ profileData.bestWinStreak }}</div>
                                <div class="text-[12px] text-[--p-text-muted-color]">Längste Siegesserie</div>
                            </template>
                        </Card>
                        <Card class="text-center">
                            <template #content>
                                <div class="text-[24px] font-bold text-[--p-primary-color]">{{ profileData.extraStats.longestLosingStreak }}</div>
                                <div class="text-[12px] text-[--p-text-muted-color]">Längste Niederlagenserie</div>
                            </template>
                        </Card>
                        <Card v-if="profileData.extraStats.bestTimeOfDay" class="text-center">
                            <template #content>
                                <div class="text-[24px] font-bold text-[--p-primary-color]">{{ profileData.extraStats.bestTimeOfDay }}</div>
                                <div class="text-[12px] text-[--p-text-muted-color]">Beste Tageszeit ({{ profileData.extraStats.bestTimeWinrate }}%)</div>
                            </template>
                        </Card>
                    </div>
                </Panel>
            </div>

            <!-- Stats Breakdown -->
            <div class="mb-[30px]">
                <Panel header="Statistiken nach Kategorie" toggleable>
                    <DataTable :value="profileData.categories" stripedRows size="small">
                        <Column field="name" header="Kategorie" />
                        <Column field="matches" header="Spiele" />
                        <Column header="Siege">
                            <template #body="{ data }">
                                {{ data.wins }}
                                <Tag class="ml-[4px]" severity="secondary" :value="(data.matches > 0 ? Math.round(data.wins / data.matches * 100) : 0) + '%'" rounded />
                            </template>
                        </Column>
                        <Column header="Trf/Spiel">
                            <template #body="{ data }">
                                {{ data.averageHits.toFixed(2) }}
                            </template>
                        </Column>
                    </DataTable>
                </Panel>
            </div>

            <!-- Partners & Rivals nebeneinander -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-[20px] mb-[30px]">
                <!-- Partners -->
                <Panel v-if="profileData.partners.length > 0" header="Häufigste Partner (2v2)" toggleable>
                    <div class="flex flex-col gap-[10px]">
                        <Card v-for="partner in profileData.partners" :key="partner.name">
                            <template #content>
                                <div class="flex items-center gap-[10px]">
                                    <Avatar :label="partner.name.charAt(0)" shape="circle" />
                                    <div class="flex-1">
                                        <router-link class="font-bold text-[14px] no-underline hover:underline text-[--p-primary-color]" :to="'/Spieler/' + partner.name.replaceAll(' ','-')">{{ partner.name }}</router-link>
                                        <div class="text-[12px] text-[--p-text-muted-color]">{{ partner.matches }} Spiele zusammen</div>
                                    </div>
                                    <Tag severity="success" :value="partner.wins + 'S'" rounded />
                                </div>
                            </template>
                        </Card>
                    </div>
                </Panel>

                <!-- Rivals -->
                <Panel v-if="profileData.rivals.length > 0" header="Top Gegner" toggleable>
                    <div class="flex flex-col gap-[10px]">
                        <Card v-for="rival in profileData.rivals" :key="rival.name">
                            <template #content>
                                <div class="flex items-center gap-[10px]">
                                    <Avatar :label="rival.name.charAt(0)" shape="circle" />
                                    <div class="flex-1">
                                        <div class="font-bold text-[14px] break-words">{{ rival.name }}</div>
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

            <!-- Match History -->
            <div class="mb-[40px]">
                <Panel header="Spielverlauf" toggleable>
                    <Timeline :value="displayedMatches" align="left">
                        <template #marker="{ item }">
                            <Tag :severity="isWin(item) ? 'success' : 'danger'" :value="isWin(item) ? 'S' : 'N'" rounded />
                        </template>
                        <template #opposite="{ item }">
                            <div class="text-[12px] text-[--p-text-muted-color]">
                                <div>{{ item.source }}</div>
                                <div v-if="item.time">{{ getGameTime(item.time) }}</div>
                            </div>
                        </template>
                        <template #content="{ item }">
                            <MatchElement :match="item.match"/>
                        </template>
                    </Timeline>
                    <Button v-if="profileData.matchHistory.length > matchLimit"
                        :label="'Mehr anzeigen (' + (profileData.matchHistory.length - matchLimit) + ' weitere)'"
                        severity="secondary" outlined class="w-full mt-[10px]"
                        @click="matchLimit += 20"
                    />
                </Panel>
            </div>
        </div>

        <!-- Player not found -->
        <Message v-if="!isLoading && !profileData" severity="warn" :closable="false" class="mt-[40px]">
            Spieler "{{ decodeURIComponent((route.params.PlayerName as string) || '').replaceAll('-', ' ') }}" wurde nicht gefunden.
        </Message>
    </Drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';
import { getPlayerProfileData } from './PlayerProfileUtilFunctions';

// PrimeVue
import ProgressSpinner from 'primevue/progressspinner';
import Drawer from 'primevue/drawer';
import Avatar from 'primevue/avatar';
import Tag from 'primevue/tag';
import Divider from 'primevue/divider';
import Card from 'primevue/card';
import Knob from 'primevue/knob';
import Badge from 'primevue/badge';
import MeterGroup from 'primevue/metergroup';
import Chip from 'primevue/chip';
import Panel from 'primevue/panel';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Timeline from 'primevue/timeline';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Chart from 'primevue/chart';

// Chart.js registrations
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

const route = useRoute();
const router = useRouter();

let drawerVisible = ref(true);
let isLoading = ref(true);
let profileData = ref<PlayerProfileData | null>(null);
let matchLimit = ref(20);

const displayedMatches = computed(() => {
    if (!profileData.value) return [];
    return profileData.value.matchHistory.slice(0, matchLimit.value);
});

const winLossMeterValues = computed(() => {
    if (!profileData.value || profileData.value.totalMatches === 0) return [];
    return [
        { label: 'Siege', value: Math.round(profileData.value.totalWins / profileData.value.totalMatches * 100), color: '#61C3D9' },
        { label: 'Niederlagen', value: Math.round(profileData.value.totalLosses / profileData.value.totalMatches * 100), color: '#EA5160' }
    ];
});

// Turn analysis pie chart
const turnChartData = computed(() => {
    if (!profileData.value) return { labels: [], datasets: [] };
    let ta = profileData.value.turnAnalysis;
    let entries = [
        { label: 'Treffer', value: ta.hit, color: '#61C3D9' },
        { label: 'Fehlwurf', value: ta.miss, color: '#94a3b8' },
        { label: 'Airball', value: ta.airball, color: '#cbd5e1' },
        { label: 'Bombe', value: ta.bomb, color: '#EA5160' },
        { label: 'Bouncer', value: ta.bouncer, color: '#f59e0b' },
        { label: 'Trickshot', value: ta.trickshot, color: '#8b5cf6' },
        { label: 'On Fire', value: ta.onfire, color: '#ef4444' },
        { label: 'Balls Back', value: ta.ballsback, color: '#22c55e' },
        { label: 'Last Cup', value: ta.lastCup, color: '#f97316' },
    ].filter(e => e.value > 0);

    return {
        labels: entries.map(e => e.label),
        datasets: [{ data: entries.map(e => e.value), backgroundColor: entries.map(e => e.color), borderWidth: 2, borderColor: '#fff' }]
    };
});

const turnChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' as const, labels: { boxWidth: 14, padding: 12 } } }
};

// Cup heatmap helpers
const cupColor = (index: number) => {
    if (!profileData.value) return '#e2e8f0';
    let max = Math.max(...profileData.value.cupHeatmap, 1);
    let ratio = profileData.value.cupHeatmap[index] / max;
    if (ratio > 0.7) return '#EA5160';
    if (ratio > 0.4) return '#f8a9b2';
    if (ratio > 0.1) return '#aaeafa';
    return '#d3f7ff';
};
const cupOpacity = (index: number) => {
    if (!profileData.value) return 0.3;
    let max = Math.max(...profileData.value.cupHeatmap, 1);
    return 0.3 + (profileData.value.cupHeatmap[index] / max) * 0.7;
};

const isWin = (entry: MatchHistoryEntry) => {
    let lo = profileData.value!.name.toLowerCase();
    // For league matches, the match data contains the team name, not the real player name
    let leagueTeam = profileData.value!.leagueTeam;
    let leagueLo = leagueTeam ? leagueTeam.toLowerCase() : null;
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

const loadProfile = async () => {
    let playerName = decodeURIComponent(route.params.PlayerName as string).replaceAll("-", " ");
    try {
        profileData.value = await getPlayerProfileData(playerName);
        if (profileData.value.totalMatches === 0) profileData.value = null;
    } catch { profileData.value = null; }
    isLoading.value = false;
};
loadProfile();

let getGameTime = (dateNumber: number) => {
    let date = new Date(dateNumber);
    let time = date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    return date.toLocaleDateString("de-DE") + " - " + time + " Uhr";
};
</script>

<style scoped>
.pp-chip-win :deep(.p-chip-label) { color: white; }
.pp-chip-win { background-color: #61C3D9 !important; color: white !important; }
.pp-chip-loss :deep(.p-chip-label) { color: white; }
.pp-chip-loss { background-color: #EA5160 !important; color: white !important; }

.mobile-sheet {
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
}

@media (width <= 900px) {
    :deep(.p-timeline-event-opposite) { flex: 0 0 80px; }
}
</style>
