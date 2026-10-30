<template>
    <BottomSheet v-model:visible="visible">
        <template #header>
            <div class="ees-title">Elo erklärt</div>
        </template>

        <p class="ees-intro">
            Jeder startet mit <b>{{ formatRating(ELO_START) }}</b>. Wer gewinnt, nimmt dem Gegner Punkte ab, gegen Stärkere mehr,
            gegen Schwächere weniger. Titel bringen keine Extrapunkte: Wer viele starke Teams schlägt, steigt automatisch.
        </p>

        <div class="ees-card">
            <div class="ees-card-title">Was du pro Spiel bekommst</div>
            <div class="ees-table-head">
                <span>Begegnung</span>
                <span>Ergebnis</span>
                <span>Punkte</span>
            </div>
            <div v-for="(row, index) in ELO_EXAMPLE_ROWS" :key="index" class="ees-table-row">
                <span>{{ row.label }}</span>
                <span>{{ row.won ? 'Sieg' : 'Niederlage' }}</span>
                <span class="ees-points" :class="row.points > 0 ? 'ees-up' : 'ees-down'">{{ formatDelta(row.points) }}</span>
            </div>
            <div class="ees-hint">Der Gegner verliert bzw. gewinnt genau so viel.</div>
            <div class="ees-extra">
                <i class="pi pi-info-circle"></i>
                <span>
                    Die Werte gelten für genau gleich stark bzw. genau 200 Unterschied. Dazwischen wird stufenlos gerechnet:
                    Bei {{ ELO_EXAMPLE_IN_BETWEEN.difference }} Unterschied bekommt der Stärkere für einen Sieg
                    <b>{{ formatDelta(ELO_EXAMPLE_IN_BETWEEN.favorite) }}</b>, der Schwächere <b>{{ formatDelta(ELO_EXAMPLE_IN_BETWEEN.underdog) }}</b>.
                    Maßgeblich ist das Rating vor dem Spiel, nicht der aktuelle Platz.
                </span>
            </div>
        </div>

        <div class="ees-card">
            <div class="ees-card-title">Im Doppel</div>
            <p class="ees-text">
                Euer Team-Rating ist der Durchschnitt: {{ formatRating(1200) }} + {{ formatRating(1000) }} → <b>{{ formatRating(1100) }}</b>.
                Nach dem Spiel bekommen beide dieselben Punkte.
            </p>
        </div>

        <div class="ees-card">
            <div class="ees-card-title">Was zählt</div>
            <ul class="ees-list">
                <li class="ees-check"><b>Liga, Cup und BiPo Open</b> – alle gleich, 1. und 2. Liga ohne Faktor</li>
                <li class="ees-check"><b>Offene Spiele</b> – jedes eingetragene Spiel zählt</li>
                <li class="ees-check">Nur Sieg oder Niederlage, nicht die Becher-Differenz</li>
            </ul>
        </div>

        <div class="ees-card">
            <div class="ees-card-title">Wer in der Liste steht</div>
            <ul class="ees-list">
                <li>In der Liste erscheint, wer mindestens <b>{{ ELO_MIN_GAMES }} Spiele</b> gemacht hat</li>
                <li>Aktiv heißt: mindestens {{ ELO_MIN_GAMES }} Spiele und eins in den letzten 6 Monaten</li>
                <li>Wer pausiert, behält sein Rating und taucht beim nächsten Spiel wieder auf</li>
            </ul>
        </div>

        <p class="ees-footnote">
            Wer immer mit demselben Partner spielt, bekommt dieselben Ergebnisse wie der Partner. Für solche Duos ist die
            Ansicht Teams“ aussagekräftiger.
        </p>
    </BottomSheet>
</template>

<script setup lang="ts">
import BottomSheet from '@/components/shared/BottomSheet.vue';
import { ELO_EXAMPLE_IN_BETWEEN, ELO_EXAMPLE_ROWS, ELO_MIN_GAMES, ELO_START } from './eloRating';

const visible = defineModel<boolean>('visible', { default: false });

const formatRating = (rating: number) => rating.toLocaleString('de-DE');
const formatDelta = (delta: number) => delta > 0 ? `+${delta}` : `−${-delta}`;
</script>

<style scoped>
.ees-title {
    font-size: 22px;
    font-weight: 700;
    color: #1d1f23;
}
.ees-intro {
    margin: 0 0 14px;
    font-size: 14px;
    line-height: 1.5;
    color: #5b616b;

    b {
        color: #1d1f23;
    }
}

.ees-card {
    background: #f4f5f7;
    border-radius: 14px;
    padding: 12px 14px;
    margin-bottom: 12px;
}
.ees-card-title {
    margin-bottom: 8px;
    font-size: 16px;
    font-weight: 700;
    color: #1d1f23;
}

.ees-table-head,
.ees-table-row {
    display: grid;
    grid-template-columns: 1fr auto 56px;
    gap: 12px;
    align-items: center;
}
.ees-table-head {
    padding-bottom: 6px;
    border-bottom: 1px solid #e3e5e9;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #6b717b;

    span:last-child {
        text-align: right;
    }
}
.ees-table-row {
    padding: 8px 0;
    border-bottom: 1px solid #e3e5e9;
    font-size: 14px;
    color: #3a3f47;
}
.ees-points {
    text-align: right;
    font-weight: 700;
}
.ees-up { color: #1f9d55; }
.ees-down { color: #d64545; }
.ees-hint {
    padding-top: 8px;
    font-size: 12px;
    color: #8a909a;
}
.ees-extra {
    display: flex;
    gap: 8px;
    margin-top: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    background: white;
    font-size: 12px;
    line-height: 1.5;
    color: #5b616b;

    i {
        margin-top: 2px;
        color: var(--main-color);
    }
    b {
        color: #1d1f23;
    }
}

.ees-text {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: #3a3f47;
}

.ees-list {
    margin: 0;
    padding-left: 18px;
    list-style: '–  ';
    font-size: 14px;
    line-height: 1.45;
    color: #3a3f47;

    li + li {
        margin-top: 6px;
    }
}
.ees-check {
    list-style: '✓  ';
}
.ees-check::marker {
    color: var(--main-color);
}

.ees-footnote {
    margin: 4px 0 0;
    font-size: 12px;
    line-height: 1.5;
    color: #8a909a;
}
</style>
