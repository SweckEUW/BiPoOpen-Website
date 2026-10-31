<template>
    <router-link to="/Weltrangliste" class="pp-elo">
        <div class="pp-elo-rank">
            <div class="pp-elo-rank-value">{{ elo.rank !== null ? `#${elo.rank}` : '–' }}</div>
            <div class="pp-elo-rank-label">{{ rankLabel }}</div>
        </div>

        <div class="pp-elo-main">
            <div class="pp-elo-rating">
                <span class="pp-elo-rating-value">{{ formatNumber(elo.rating) }}</span>
                <span class="pp-elo-rating-unit">Elo</span>
                <span class="pp-elo-delta" :class="deltaClass">{{ deltaLabel }}</span>
            </div>
            <svg class="pp-elo-spark" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true">
                <polyline :points="sparkPoints" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
            </svg>
            <div class="pp-elo-caption">letzte {{ ELO_HISTORY_DAYS }} Tage · Bestwert {{ formatNumber(elo.peak) }}</div>
        </div>

        <i class="pi pi-chevron-right pp-elo-chevron"></i>
    </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ELO_HISTORY_DAYS, ELO_MIN_GAMES } from '@/components/frontend/worldRanking/eloRating';

const props = defineProps<{ elo: PlayerEloSummary }>();

const formatNumber = (value: number) => value.toLocaleString('de-DE');

const rankLabel = computed(() => {
    if (props.elo.rank !== null) return 'Weltrangliste';
    if (props.elo.inactive) return 'inaktiv';
    return `ab ${ELO_MIN_GAMES} Spielen`;
});

const deltaLabel = computed(() => {
    const change = props.elo.ratingChange;
    if (change > 0) return `▲ ${change}`;
    if (change < 0) return `▼ ${-change}`;
    return '±0';
});

const deltaClass = computed(() => props.elo.ratingChange > 0 ? 'is-up' : props.elo.ratingChange < 0 ? 'is-down' : '');

// Verlauf auf 100 x 28 skaliert, ohne Spiele im Zeitraum eine flache Linie
const sparkPoints = computed(() => {
    const ratings = props.elo.historyRatings.length > 1 ? props.elo.historyRatings : [props.elo.rating, props.elo.rating];
    const min = Math.min(...ratings);
    const range = Math.max(...ratings) - min;
    return ratings
        .map((rating, index) => {
            const x = index / (ratings.length - 1) * 100;
            const y = range === 0 ? 14 : 25 - (rating - min) / range * 22;
            return `${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(' ');
});
</script>

<style scoped>
.pp-elo {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 14px 14px 16px;
    border-radius: 16px;
    background: linear-gradient(135deg, #14213d 0%, #1e3a6b 100%);
    color: white;
    text-decoration: none;
    box-shadow: 0 4px 14px rgba(20, 33, 61, 0.25);
}

.pp-elo-rank {
    flex-shrink: 0;
    min-width: 72px;
    padding-right: 14px;
    border-right: 1px solid rgba(255, 255, 255, 0.15);
    text-align: center;
}
.pp-elo-rank-value {
    font-size: 28px;
    font-weight: 800;
    line-height: 1.1;
}
.pp-elo-rank-label {
    margin-top: 2px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.65);
}

.pp-elo-main {
    flex: 1;
    min-width: 0;
}
.pp-elo-rating {
    display: flex;
    align-items: baseline;
    gap: 6px;
}
.pp-elo-rating-value {
    font-size: 22px;
    font-weight: 800;
}
.pp-elo-rating-unit {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.65);
}
.pp-elo-delta {
    font-size: 13px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.65);
}
.pp-elo-delta.is-up { color: #4ade80; }
.pp-elo-delta.is-down { color: #f87171; }

.pp-elo-spark {
    display: block;
    width: 100%;
    height: 26px;
    margin: 4px 0 2px;
    color: var(--secondary-color);
}
.pp-elo-caption {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.65);
}
.pp-elo-chevron {
    flex-shrink: 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
}
</style>
