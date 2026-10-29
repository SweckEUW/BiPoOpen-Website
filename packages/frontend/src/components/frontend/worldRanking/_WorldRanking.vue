<template>
    <div class="WorldRanking">

        <div class="wr-header">
            <div class="wr-header-text">
                <h1 class="wr-title">Weltrangliste</h1>
                <div class="wr-subtitle">Stand {{ formattedDate }} · Punkte der letzten 12 Monate</div>
            </div>
            <button type="button" class="wr-info-button" @click="showPointsSystem = true">
                <i class="pi pi-info-circle"></i>
                Punktesystem
            </button>
        </div>

        <div class="wr-chips">
            <button
                v-for="chip in chips"
                :key="chip.key"
                type="button"
                class="wr-chip"
                :class="{ 'wr-chip-active': view === chip.key }"
                @click="selectView(chip.key)"
            >
                <span v-if="chip.color" class="wr-swatch" :style="{ background: chip.color }"></span>
                {{ chip.label }}
            </button>
        </div>

        <Loadingscreen v-if="isLoading"/>

        <div v-else class="wr-board">
            <div class="wr-card">
                <div class="wr-card-head">
                    <span class="wr-col-rank">#</span>
                    <span class="wr-col-player">{{ view === 'total' ? 'Spieler · Punkte-Mix' : 'Spieler' }}</span>
                    <span class="wr-col-points">Punkte</span>
                </div>

                <div v-if="hasError" class="wr-empty">Die Rangliste konnte nicht geladen werden.</div>
                <div v-else-if="!ranking.length" class="wr-empty">Noch keine Punkte in den letzten 12 Monaten.</div>

                <div v-for="entry in ranking" :key="entry.key" class="wr-entry" :class="{ 'wr-entry-top': entry.rank <= 3 }">
                    <button type="button" class="wr-row" :aria-expanded="expandedKey === entry.key" @click="toggleEntry(entry.key)">
                        <div class="wr-col-rank">
                            <div class="wr-rank">{{ entry.rank }}</div>
                            <div class="wr-trend" :class="getTrendClass(entry.trend)">{{ getTrendLabel(entry.trend) }}</div>
                        </div>

                        <Avatar :name="entry.name" class="wr-avatar"/>

                        <div class="wr-main">
                            <div class="wr-name">{{ entry.name }}</div>
                            <div class="wr-bar" :style="{ width: getBarWidth(entry) }">
                                <span
                                    v-for="segment in getSegments(entry)"
                                    :key="segment.key"
                                    class="wr-bar-segment"
                                    :style="{ flexGrow: segment.points, background: segment.color }"
                                ></span>
                            </div>
                        </div>

                        <div class="wr-col-points wr-points">{{ getScore(entry) }}</div>
                    </button>

                    <div v-if="expandedKey === entry.key" class="wr-details">
                        <div v-for="category in RANKING_CATEGORIES" :key="category.key" class="wr-detail-row">
                            <span class="wr-detail-label">
                                <span class="wr-swatch" :style="{ background: category.color }"></span>
                                {{ category.label }}
                            </span>
                            <span class="wr-detail-track">
                                <span
                                    class="wr-detail-fill"
                                    :style="{ width: getCategoryWidth(entry, category.key), background: category.color }"
                                ></span>
                            </span>
                            <span class="wr-detail-value">{{ entry.points[category.key] }}</span>
                        </div>
                        <div class="wr-detail-footer">
                            <span>{{ entry.games }} Spiele in 12 Monaten</span>
                            <button type="button" class="wr-profile-link" @click="openPlayerProfile(entry.name)">
                                Zum Spielerprofil <i class="pi pi-angle-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <p class="wr-footnote">
                Gewertet wird, wer in den letzten 12 Monaten mindestens {{ RANKING_MIN_GAMES }} Spiele gemacht hat.
                Pfeile zeigen die Veränderung zum Stand vor {{ RANKING_TREND_DAYS }} Tagen.
            </p>
        </div>

        <WorldRankingPointsSheet v-model:visible="showPointsSystem"/>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import Avatar from '@/components/shared/Avatar.vue';
import Loadingscreen from '@/components/shared/Loadingscreen.vue';
import WorldRankingPointsSheet from './WorldRankingPointsSheet.vue';
import { useWorldRankingData } from './useWorldRankingData';
import {
    RANKING_CATEGORIES, RANKING_MIN_GAMES, RANKING_TREND_DAYS,
    RankingCategory, RankingView, WorldRankingEntry, getWorldRanking,
} from './worldRankingPoints';

const openPlayerProfile = inject<(name: string) => void>('openPlayerProfile')!;

const { now, events, isLoading, hasError } = useWorldRankingData();

const formattedDate = new Date(now).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

const chips: { key: RankingView; label: string; color?: string }[] = [
    { key: 'total', label: 'Gesamt' },
    ...RANKING_CATEGORIES.map(category => ({ key: category.key, label: category.label, color: category.color })),
];

const view = ref<RankingView>('total');
const expandedKey = ref<string | null>(null);
const showPointsSystem = ref(false);

const selectView = (key: RankingView) => {
    view.value = key;
    expandedKey.value = null;
};

const toggleEntry = (key: string) => {
    expandedKey.value = expandedKey.value === key ? null : key;
};

const ranking = computed(() => events.value ? getWorldRanking(events.value, now, view.value) : []);

const getScore = (entry: WorldRankingEntry) => view.value === 'total' ? entry.total : entry.points[view.value];

// Balken relativ zum Ersten, Detailbalken relativ zum Besten der jeweiligen Kategorie
const leaderScore = computed(() => Math.max(1, ...ranking.value.map(getScore)));
const categoryMax = computed(() => Object.fromEntries(RANKING_CATEGORIES.map(({ key }) =>
    [key, Math.max(1, ...ranking.value.map(entry => entry.points[key]))]
)) as Record<RankingCategory, number>);

const getBarWidth = (entry: WorldRankingEntry) => `${(getScore(entry) / leaderScore.value) * 100}%`;
const getCategoryWidth = (entry: WorldRankingEntry, key: RankingCategory) => `${(entry.points[key] / categoryMax.value[key]) * 100}%`;

const getSegments = (entry: WorldRankingEntry) => RANKING_CATEGORIES
    .filter(category => view.value === 'total' || view.value === category.key)
    .map(category => ({ key: category.key, color: category.color, points: entry.points[category.key] }))
    .filter(segment => segment.points > 0);

const getTrendLabel = (trend: number | null) => {
    if (trend === null) return 'neu';
    if (trend > 0) return `▲${trend}`;
    if (trend < 0) return `▼${-trend}`;
    return '–';
};

const getTrendClass = (trend: number | null) => {
    if (trend === null) return 'wr-trend-new';
    if (trend > 0) return 'wr-trend-up';
    if (trend < 0) return 'wr-trend-down';
    return 'wr-trend-same';
};
</script>

<style scoped>
.WorldRanking {
    max-width: 720px;
    margin: 0 auto;
    color: #1d1f23;
}

/* ── Header ── */
.wr-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0 14px;
}
.wr-title {
    margin: 0;
    font-size: 30px;
    font-weight: 800;
    line-height: 1.15;
    color: #1d1f23;
}
.wr-subtitle {
    margin-top: 4px;
    font-size: 13px;
    color: #6b717b;
}
.wr-info-button {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border: 1px solid #dcdfe4;
    border-radius: 999px;
    background: white;
    color: #1d1f23;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
}
.wr-info-button:hover {
    background: #f4f5f7;
}

/* ── Filter ── */
.wr-chips {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding-bottom: 14px;
    scrollbar-width: none;
}
.wr-chip {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 9px 14px;
    border: 1px solid #dcdfe4;
    border-radius: 999px;
    background: white;
    color: #1d1f23;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}
.wr-chip-active {
    background: #1d1f23;
    border-color: #1d1f23;
    color: white;
}
.wr-swatch {
    display: inline-block;
    flex-shrink: 0;
    width: 10px;
    height: 10px;
    border-radius: 3px;
}

/* ── Liste ── */
.wr-board {
    border-radius: 18px;
    background: var(--page-gray);
}

.wr-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.wr-card-head {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-bottom: 1px solid #eef0f2;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #6b717b;
}
.wr-card-head .wr-col-player {
    flex: 1;
    padding-left: 52px; /* unter dem Namen, neben dem Avatar */
}

.wr-col-rank {
    flex-shrink: 0;
    width: 28px;
    text-align: center;
}
.wr-col-points {
    flex-shrink: 0;
    min-width: 44px;
    text-align: right;
}

.wr-entry {
    border-bottom: 1px solid #eef0f2;
}
.wr-entry:last-child {
    border-bottom: none;
}
.wr-entry-top {
    background: #fffcf0;
}

.wr-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px 14px;
    border: none;
    background: none;
    color: inherit;
    text-align: left;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
}
.wr-rank {
    font-size: 17px;
    font-weight: 700;
    line-height: 1.1;
}
.wr-trend {
    font-size: 11px;
    font-weight: 700;
    line-height: 1.3;
}
.wr-trend-up { color: #1f9d55; }
.wr-trend-down { color: #d64545; }
.wr-trend-same { color: #a0a5ad; }
.wr-trend-new { color: var(--secondary-color); font-weight: 600; }

.wr-avatar {
    flex-shrink: 0;
    width: 40px !important;
    height: 40px !important;
    font-size: 14px;
    font-weight: 700;
}

.wr-main {
    flex: 1;
    min-width: 0;
}
.wr-name {
    overflow: hidden;
    font-size: 15px;
    font-weight: 700;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.wr-bar {
    display: flex;
    gap: 1px;
    min-width: 6px;
    height: 7px;
    margin-top: 6px;
    border-radius: 4px;
    overflow: hidden;
}
.wr-bar-segment {
    flex-basis: 0;
    min-width: 2px;
}
.wr-points {
    font-size: 18px;
    font-weight: 800;
}

/* ── Aufgeklappte Zeile ── */
.wr-details {
    margin: 0 14px 14px;
    padding: 12px 14px;
    background: #f4f5f7;
    border-radius: 12px;
}
.wr-detail-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 0;
    font-size: 13px;
}
.wr-detail-label {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 76px;
    flex-shrink: 0;
}
.wr-detail-track {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: #e3e5e9;
    overflow: hidden;
}
.wr-detail-fill {
    display: block;
    height: 100%;
    border-radius: 3px;
}
.wr-detail-value {
    width: 36px;
    flex-shrink: 0;
    text-align: right;
    font-weight: 700;
}
.wr-detail-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #e3e5e9;
    font-size: 12px;
    color: #6b717b;
}
.wr-profile-link {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 0;
    border: none;
    background: none;
    color: var(--main-color);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
}

.wr-empty {
    padding: 30px 14px;
    text-align: center;
    font-size: 14px;
    color: #6b717b;
}
.wr-footnote {
    margin: 12px 2px 10px;
    font-size: 12px;
    line-height: 1.5;
    color: #8a909a;
}

@media (width <= 360px) {
    .wr-title {
        font-size: 24px;
    }
    .wr-info-button {
        padding: 7px 10px;
    }
}
</style>
