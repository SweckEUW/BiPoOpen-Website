<template>
    <!-- Spiele & Treffer -->
    <div class="pp-section-title">Spiele & Treffer</div>

    <div class="mb-[10px]">
        <Panel :pt="{ header: { class: 'p-2' } }">
            <!-- Siegquote & Spiele -->
            <div class="grid grid-cols-2 gap-[12px] pb-[14px] border-b border-[--p-content-border-color]">
                <div class="flex flex-col items-center justify-center">
                    <Knob :modelValue="data.winrate" :size="90" readonly :strokeWidth="8" valueTemplate="{value}%" />
                    <div class="text-[13px] text-[--p-text-muted-color] mt-[2px]">Siegquote</div>
                    <TrendIndicator :value="data.trends.winrateTrend" suffix="%" />
                </div>
                <div class="text-center flex flex-col justify-center">
                    <div class="text-[28px] font-bold text-[--p-primary-color]">{{ data.totalMatches }}</div>
                    <div class="text-[13px] text-[--p-text-muted-color] mt-[2px]">Spiele</div>
                    <div class="flex justify-center gap-[8px] mt-[6px]">
                        <Tag severity="success" :value="data.totalWins + ' Siege'" rounded />
                        <Tag severity="danger" :value="data.totalLosses + ' Niederl.'" rounded />
                    </div>
                    <TrendIndicator :value="data.trends.totalMatchesTrend" />
                </div>
            </div>

            <!-- Treffer -->
            <div class="flex justify-center items-end gap-[32px] pb-[14px] pt-[14px] border-b border-[--p-content-border-color]">
                <div class="text-center">
                    <div class="text-[13px] text-[--p-text-muted-color] mb-[4px]">Treffer / Spiel</div>
                    <div class="text-[28px] font-bold text-[--p-primary-color]">{{ data.averageHits }}</div>
                    <TrendIndicator :value="data.trends.averageHitsTrend" />
                </div>
                <div class="text-center">
                    <div class="text-[13px] text-[--p-text-muted-color] mb-[4px]">Treffer gesamt</div>
                    <div class="text-[28px] font-bold text-[--p-primary-color]">{{ data.totalHits }}</div>
                    <TrendIndicator :value="data.trends.totalHitsTrend" />
                </div>
            </div>

            <!-- Letzte 5 Spiele -->
            <div v-if="recentForm.length > 0" class="pb-[14px] pt-[14px] text-centerborder-b border-[--p-content-border-color]">
                <div class="pp-subsection-title">Letzte 5 Spiele</div>
                <div class="flex justify-center gap-[6px]">
                    <Chip
                        v-for="(result, index) in recentForm"
                        :key="index"
                        :label="result === 'W' ? 'S' : 'N'"
                        :class="result === 'W' ? 'pp-chip-win' : 'pp-chip-loss'"
                        class="shrink-0"
                    />
                </div>
            </div>

            <!-- Serien & Rekorde -->
            <div class="grid grid-cols-3 gap-[12px] pb-[14px] border-b border-[--p-content-border-color]">
                <div class="text-center">
                    <div class="text-[24px] font-bold text-[--p-primary-color]">{{ data.currentWinStreak }}</div>
                    <div class="text-[12px] text-[--p-text-muted-color]">Aktuelle Serie</div>
                </div>
                <div class="text-center">
                    <div class="text-[24px] font-bold text-[--p-primary-color]">{{ data.bestWinStreak }}</div>
                    <div class="text-[12px] text-[--p-text-muted-color]">Längste Siegesserie</div>
                </div>
                <div class="text-center">
                    <div class="text-[24px] font-bold text-[--p-primary-color]">{{ data.extraStats.longestLosingStreak }}</div>
                    <div class="text-[12px] text-[--p-text-muted-color]">Längste Niederlagenserie</div>
                </div>
            </div>

            <!-- Kategorien -->
            <DataTable :value="data.categories" stripedRows size="small">
                <Column field="name" header="Kategorie" />
                <Column field="matches" header="Spiele" />
                <Column header="Siege">
                    <template #body="{ data: row }">
                        {{ row.wins }}
                        <Tag class="ml-[4px]" severity="secondary" :value="(row.matches > 0 ? Math.round(row.wins / row.matches * 100) : 0) + '%'" rounded />
                    </template>
                </Column>
                <Column header="Trf/Spiel">
                    <template #body="{ data: row }">
                        {{ row.averageHits.toFixed(2) }}
                    </template>
                </Column>
            </DataTable>
        </Panel>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TrendIndicator from './TrendIndicator.vue';
import Knob from 'primevue/knob';
import Tag from 'primevue/tag';
import Panel from 'primevue/panel';
import Chip from 'primevue/chip';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const props = defineProps<{
    data: PlayerProfileData;
}>();

const recentForm = computed(() => props.data.recentForm.slice(0, 5));
</script>

<style scoped>
.pp-section-title {
    font-size: 20px;
    font-weight: bold;
    color: var(--p-primary-color);
    margin-bottom: 12px;
}
.pp-subsection-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--p-text-muted-color);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 10px;
}
.pp-chip-win :deep(.p-chip-label) { color: white; }
.pp-chip-win { background-color: #61C3D9 !important; color: white !important; }
.pp-chip-loss :deep(.p-chip-label) { color: white; }
.pp-chip-loss { background-color: #EA5160 !important; color: white !important; }
</style>
