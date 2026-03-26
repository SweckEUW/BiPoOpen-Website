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
            <div class="analysis-highlights mb-[12px]">
                <div v-if="strongestTimeOfDay" class="analysis-highlight-card analysis-highlight-card--strongest">
                    <div class="analysis-highlight-card__label">Stärkste Tageszeit</div>
                    <div class="analysis-highlight-card__value">{{ strongestTimeOfDay.label }}</div>
                    <div class="analysis-highlight-card__meta">{{ strongestTimeOfDay.winrate }}% Siegquote ({{ strongestTimeOfDay.total }} Spiele)</div>
                </div>
                <div v-if="mostActiveTimeOfDay" class="analysis-highlight-card analysis-highlight-card--active">
                    <div class="analysis-highlight-card__label">Aktivste Tageszeit</div>
                    <div class="analysis-highlight-card__value">{{ mostActiveTimeOfDay.label }}</div>
                    <div class="analysis-highlight-card__meta">{{ mostActiveTimeOfDay.total }} Spiele</div>
                </div>
            </div>
            <div v-if="!strongestTimeOfDay && !mostActiveTimeOfDay" class="text-[12px] text-[--p-text-muted-color] text-center mb-[8px]">
                Für stärkste/aktivste Tageszeit werden nur Zeitblöcke mit mehr als 4 Spielen berücksichtigt.
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

type TimeOfDayStat = {
    label: string;
    wins: number;
    losses: number;
    total: number;
    winrate: number;
};

const timeOfDayStats = computed<TimeOfDayStat[]>(() => props.data.extraStats.timeOfDayStats as TimeOfDayStat[]);

const strongestTimeOfDay = computed<TimeOfDayStat | null>(() => {
    let best: TimeOfDayStat | null = null;
    for (const block of timeOfDayStats.value) {
        if (block.total <= 4) continue;
        if (!best || block.winrate > best.winrate) {
            best = block;
        }
    }
    return best;
});

const mostActiveTimeOfDay = computed<TimeOfDayStat | null>(() => {
    let mostActive: TimeOfDayStat | null = null;
    for (const block of timeOfDayStats.value) {
        if (block.total <= 4) continue;
        if (!mostActive || block.total > mostActive.total) {
            mostActive = block;
        }
    }
    return mostActive;
});

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
    let stats = timeOfDayStats.value;
    let strongestLabel = strongestTimeOfDay.value?.label;
    let mostActiveLabel = mostActiveTimeOfDay.value?.label;

    let winsBackground = stats.map(s => s.label === strongestLabel ? '#0e7490' : s.label === mostActiveLabel ? '#0891b2' : '#61C3D9');
    let lossesBackground = stats.map(s => s.label === strongestLabel ? '#be123c' : s.label === mostActiveLabel ? '#e11d48' : '#EA5160');
    let borderWidth = stats.map(s => s.label === strongestLabel || s.label === mostActiveLabel ? 2 : 1);
    let borderColor = stats.map(s => {
        if (s.label === strongestLabel && s.label === mostActiveLabel) return '#1f2937';
        if (s.label === strongestLabel) return '#0c4a6e';
        if (s.label === mostActiveLabel) return '#9f1239';
        return 'transparent';
    });

    return {
        labels: stats.map(s => s.label),
        datasets: [
            { type: 'bar' as const, label: 'Siege', data: stats.map(s => s.wins), backgroundColor: winsBackground, borderColor, borderWidth, stack: 'games' },
            { type: 'bar' as const, label: 'Niederlagen', data: stats.map(s => s.losses), backgroundColor: lossesBackground, borderColor, borderWidth, stack: 'games' },
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
                    let block = timeOfDayStats.value[idx];
                    if (!block) return '';
                    let details = [`Gesamt: ${block.total} Spiele`, `Siegquote: ${block.winrate}%`];
                    if (block.label === strongestTimeOfDay.value?.label) details.push('Stärkste Tageszeit');
                    if (block.label === mostActiveTimeOfDay.value?.label) details.push('Aktivste Tageszeit');
                    return details;
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

.analysis-highlights {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 10px;
}

.analysis-highlight-card {
    border-radius: 12px;
    border: 1px solid transparent;
    padding: 10px 12px;
    text-align: center;
}

.analysis-highlight-card__label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--p-text-muted-color);
}

.analysis-highlight-card__value {
    font-size: 18px;
    font-weight: 800;
    margin-top: 2px;
}

.analysis-highlight-card__meta {
    font-size: 12px;
    margin-top: 2px;
    color: var(--p-text-muted-color);
}

.analysis-highlight-card--strongest {
    background: linear-gradient(135deg, rgba(14, 116, 144, 0.15), rgba(14, 116, 144, 0.06));
    border-color: rgba(14, 116, 144, 0.4);
}

.analysis-highlight-card--strongest .analysis-highlight-card__value {
    color: #0e7490;
}

.analysis-highlight-card--active {
    background: linear-gradient(135deg, rgba(225, 29, 72, 0.15), rgba(225, 29, 72, 0.06));
    border-color: rgba(225, 29, 72, 0.4);
}

.analysis-highlight-card--active .analysis-highlight-card__value {
    color: #be123c;
}
</style>
