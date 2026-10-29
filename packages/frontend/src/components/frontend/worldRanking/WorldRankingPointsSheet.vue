<template>
    <BottomSheet v-model:visible="visible">
        <template #header>
            <div class="wps-title">Punktesystem</div>
        </template>

        <p class="wps-intro">
            Punkte aus allen Spielarten der letzten 12 Monate werden addiert. Ältere Punkte fallen raus, so kann jeder
            aufholen. Team-Punkte bekommt jeder Spieler des Teams.
        </p>

        <div v-for="section in POINTS_SYSTEM_SECTIONS" :key="section.title" class="wps-card">
            <div class="wps-card-header">
                <span class="wps-badge" :style="{ background: getCategory(section.category).color }">{{ getCategory(section.category).letter }}</span>
                <span class="wps-card-title">{{ section.title }}</span>
            </div>
            <div v-for="row in section.rows" :key="row.label" class="wps-row">
                <span>{{ row.label }}</span>
                <span class="wps-value">{{ row.value }}</span>
            </div>
        </div>

        <ul class="wps-notes">
            <li>In der Rangliste steht, wer in den letzten 12 Monaten mindestens {{ RANKING_MIN_GAMES }} Spiele gemacht hat.</li>
            <li>Die Pfeile zeigen die Veränderung zum Stand vor {{ RANKING_TREND_DAYS }} Tagen.</li>
        </ul>
    </BottomSheet>
</template>

<script setup lang="ts">
import BottomSheet from '@/components/shared/BottomSheet.vue';
import { POINTS_SYSTEM_SECTIONS, RANKING_CATEGORIES, RANKING_MIN_GAMES, RANKING_TREND_DAYS, RankingCategory } from './worldRankingPoints';

const visible = defineModel<boolean>('visible', { default: false });

const getCategory = (key: RankingCategory) => RANKING_CATEGORIES.find(category => category.key === key)!;
</script>

<style scoped>
.wps-title {
    font-size: 22px;
    font-weight: 700;
    color: #1d1f23;
}
.wps-intro {
    margin: 0 0 14px;
    font-size: 14px;
    line-height: 1.5;
    color: #5b616b;
}

.wps-card {
    background: #f4f5f7;
    border-radius: 14px;
    padding: 12px 14px 8px;
    margin-bottom: 12px;
}
.wps-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
}
.wps-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 7px;
    color: white;
    font-size: 13px;
    font-weight: 700;
}
.wps-card-title {
    font-size: 16px;
    font-weight: 700;
    color: #1d1f23;
}
.wps-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 4px 0;
    font-size: 14px;
    color: #3a3f47;
}
.wps-value {
    font-weight: 700;
    color: #1d1f23;
    white-space: nowrap;
}

.wps-notes {
    margin: 4px 0 0;
    padding-left: 18px;
    list-style: disc;
    font-size: 12px;
    line-height: 1.5;
    color: #8a909a;
}
</style>
