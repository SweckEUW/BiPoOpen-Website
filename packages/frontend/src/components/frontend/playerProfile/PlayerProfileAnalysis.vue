<template>
    <!-- Analyse -->
    <div class="pp-section-title">Analyse</div>

    <div v-if="data.turnAnalysis.total > 0" class="mb-[10px]">
        <Panel header="Wurfanalyse">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-[20px]">
                <div>
                    <div class="text-[16px] font-bold text-center mb-[10px] text-[--p-primary-color]">Wurfverteilung</div>
                    <Chart type="doughnut" :data="turnChartData" :options="turnChartOptions" />
                </div>
                <div>
                    <div class="text-[16px] font-bold text-center mb-[10px] text-[--p-primary-color]">Cup Heatmap</div>
                    <div class="text-[12px] text-[--p-text-muted-color] text-center mb-[8px]">Hotspots: Häufig getroffene Becher</div>
                    <svg viewBox="0 0 300 260" class="w-full max-w-[300px] mx-auto">
                        <circle v-for="i in 4" :key="'r4-'+i" :cx="75 + (i-1) * 50" cy="40" r="22"
                            :fill="cupColor(i-1)" :opacity="cupOpacity(i-1)" stroke="#333" stroke-width="1.5" />
                        <text v-for="i in 4" :key="'t4-'+i" :x="75 + (i-1) * 50" y="45"
                            text-anchor="middle" font-size="12" fill="#333" font-weight="bold">{{ data.cupHeatmap[i-1] }}</text>
                        <circle v-for="i in 3" :key="'r3-'+i" :cx="100 + (i-1) * 50" cy="100" r="22"
                            :fill="cupColor(i+3)" :opacity="cupOpacity(i+3)" stroke="#333" stroke-width="1.5" />
                        <text v-for="i in 3" :key="'t3-'+i" :x="100 + (i-1) * 50" y="105"
                            text-anchor="middle" font-size="12" fill="#333" font-weight="bold">{{ data.cupHeatmap[i+3] }}</text>
                        <circle v-for="i in 2" :key="'r2-'+i" :cx="125 + (i-1) * 50" cy="160" r="22"
                            :fill="cupColor(i+6)" :opacity="cupOpacity(i+6)" stroke="#333" stroke-width="1.5" />
                        <text v-for="i in 2" :key="'t2-'+i" :x="125 + (i-1) * 50" y="165"
                            text-anchor="middle" font-size="12" fill="#333" font-weight="bold">{{ data.cupHeatmap[i+6] }}</text>
                        <circle cx="150" cy="220" r="22"
                            :fill="cupColor(9)" :opacity="cupOpacity(9)" stroke="#333" stroke-width="1.5" />
                        <text x="150" y="225" text-anchor="middle" font-size="12" fill="#333" font-weight="bold">{{ data.cupHeatmap[9] }}</text>
                    </svg>
                    <div class="flex justify-center gap-[8px] mt-[8px]">
                        <div class="flex items-center gap-[4px] text-[12px]"><span class="inline-block w-[12px] h-[12px] rounded-full" style="background: #d3f7ff"></span>Wenig</div>
                        <div class="flex items-center gap-[4px] text-[12px]"><span class="inline-block w-[12px] h-[12px] rounded-full" style="background: #EA5160"></span>Hotspot</div>
                    </div>
                </div>
            </div>
        </Panel>
    </div>

    <div v-if="data.extraStats.timeOfDayStats.length > 0" class="mb-[10px]">
        <Panel header="Siege / Niederlagen nach Tageszeit">
            <div class="flex justify-center gap-[24px] text-[12px] text-[--p-text-muted-color] text-center mb-[8px] flex-wrap">
                <div v-if="data.extraStats.bestTimeOfDay">
                    Stärkste Tageszeit: <strong class="text-[--p-primary-color]">{{ data.extraStats.bestTimeOfDay }}</strong>
                    <span v-if="data.extraStats.bestTimeWinrate !== null"> ({{ data.extraStats.bestTimeWinrate }}% Siegquote)</span>
                </div>
                <div v-if="data.extraStats.mostActiveTimeOfDay">
                    Aktivste Tageszeit: <strong class="text-[--p-primary-color]">{{ data.extraStats.mostActiveTimeOfDay }}</strong>
                    <span v-if="data.extraStats.mostActiveGames !== null"> ({{ data.extraStats.mostActiveGames }} Spiele)</span>
                </div>
            </div>
            <Chart type="bar" :data="timeOfDayChartData" :options="timeOfDayChartOptions" />
        </Panel>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Panel from 'primevue/panel';
import Chart from 'primevue/chart';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const props = defineProps<{
    data: PlayerProfileData;
}>();

const turnChartData = computed(() => {
    let ta = props.data.turnAnalysis;
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

const timeOfDayChartData = computed(() => {
    let stats = props.data.extraStats.timeOfDayStats;
    return {
        labels: stats.map(s => s.label),
        datasets: [
            { type: 'bar' as const, label: 'Siege', data: stats.map(s => s.wins), backgroundColor: '#61C3D9', borderColor: '#61C3D9', borderWidth: 1, stack: 'games' },
            { type: 'bar' as const, label: 'Niederlagen', data: stats.map(s => s.losses), backgroundColor: '#EA5160', borderColor: '#EA5160', borderWidth: 1, stack: 'games' },
        ]
    };
});

const timeOfDayChartOptions = computed(() => ({
    responsive: true,
    interaction: { mode: 'index' as const, intersect: false },
    scales: {
        x: { ticks: { maxRotation: 45, minRotation: 0, font: { size: 11 } } },
        y: { type: 'linear' as const, position: 'left' as const, min: 0, stacked: true, title: { display: true, text: 'Anzahl Spiele' }, ticks: { stepSize: 1 } },
    },
    plugins: {
        legend: { position: 'bottom' as const, labels: { boxWidth: 14, padding: 12 } },
        tooltip: {
            callbacks: {
                afterBody: (items: any[]) => {
                    let idx = items[0]?.dataIndex;
                    if (idx === undefined) return '';
                    let block = props.data.extraStats.timeOfDayStats[idx];
                    if (!block) return '';
                    return [`Gesamt: ${block.total} Spiele`, `Siegquote: ${block.winrate}%`];
                }
            }
        }
    },
}));

const cupColor = (index: number) => {
    let max = Math.max(...props.data.cupHeatmap, 1);
    let ratio = props.data.cupHeatmap[index] / max;
    if (ratio > 0.7) return '#EA5160';
    if (ratio > 0.4) return '#f8a9b2';
    if (ratio > 0.1) return '#aaeafa';
    return '#d3f7ff';
};

const cupOpacity = (index: number) => {
    let max = Math.max(...props.data.cupHeatmap, 1);
    return 0.3 + (props.data.cupHeatmap[index] / max) * 0.7;
};
</script>

<style scoped>
.pp-section-title {
    font-size: 20px;
    font-weight: bold;
    color: var(--p-primary-color);
    margin-bottom: 12px;
}
</style>
