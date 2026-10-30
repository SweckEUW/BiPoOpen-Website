<template>
    <BottomSheet v-model:visible="visible">
        <template #header>
            <div>
                <div class="ge-title">{{ title }}</div>
                <div v-if="subtitle" class="ge-subtitle">{{ subtitle }}</div>
            </div>
        </template>

        <div class="GameEntryDrawer">
            <!-- Zusatzauswahl ueber den Seiten, z.B. Pokal-Paarung -->
            <slot name="top" :sides="sides" :setTeams="setTeams"></slot>

            <div v-for="(side, sideIndex) in sides" :key="sideIndex"
                class="ge-side"
                :class="{ 'ge-side--winner': winnerIndex === sideIndex }"
            >
                <div class="ge-side-header">
                    <template v-if="lockedNames">
                        <Avatar v-if="getSideName(side)" :name="getSideName(side)" :avatarImage="side.logo" :shape="avatarShape" class="ge-team-avatar" />
                        <span v-else class="ge-team-avatar ge-team-avatar--empty">?</span>
                        <span class="ge-team-name" :class="{ 'ge-team-name--empty': !getSideName(side) }">{{ getSideName(side) || sideLabels[sideIndex] }}</span>
                    </template>
                    <span v-else class="ge-side-label">{{ sideLabels[sideIndex] }}</span>

                    <span v-if="winnerIndex === sideIndex" class="ge-win-badge">Sieg</span>
                    <span class="ge-side-score" :class="{ 'ge-side-score--empty': totals[sideIndex] === null }">{{ totals[sideIndex] ?? '—' }}</span>
                </div>

                <div v-for="(player, playerIndex) in side.players" :key="playerIndex" class="ge-player">
                    <!-- Feste Namen: bei mehreren Spielern pro Seite steht der Name ueber den Treffern -->
                    <div v-if="lockedNames && side.players.length > 1" class="ge-player-name">
                        <Avatar :name="player.name" shape="circle" class="ge-player-avatar" />
                        <span>{{ player.name }}</span>
                    </div>

                    <template v-else-if="!lockedNames">
                        <slot name="player"
                            :side="side"
                            :sideIndex="sideIndex"
                            :player="player"
                            :playerIndex="playerIndex"
                            :excludedNames="getExcludedNames(player)"
                            :setName="(name: string) => setPlayerName(side, playerIndex, name)"
                        >
                            <GameEntryPlayerSearch
                                :modelValue="player.name"
                                :excludedNames="getExcludedNames(player)"
                                :removable="playerIndex > 0"
                                @update:modelValue="name => setPlayerName(side, playerIndex, name)"
                                @clear="clearPlayer(side, playerIndex)"
                            />
                        </slot>
                    </template>

                    <GameEntryScorePicker
                        v-model="player.score"
                        :max="maxScore"
                        :disabled="!player.name.trim()"
                        :label="`Treffer ${player.name || sideLabels[sideIndex]}`"
                    />
                </div>

                <button v-if="canAddPlayer(side)" type="button" class="ge-add-player" @click="addPlayer(side)">
                    <i class="pi pi-plus"></i>
                    Mitspieler ({{ side.players.length + 1 }} gegen {{ side.players.length + 1 }})
                </button>
            </div>

            <div class="ge-footer">
                <button v-if="remove" type="button" class="ge-button ge-button-delete" :disabled="loading" aria-label="Spiel löschen" @click="onDelete()">
                    <i class="pi pi-trash"></i>
                </button>
                <button type="button" class="ge-button ge-button-save" :disabled="!canSave || loading" @click="onSave()">
                    <i v-if="loading" class="pi pi-spin pi-spinner"></i>
                    <span v-else>{{ saveLabel }}</span>
                </button>
            </div>
        </div>
    </BottomSheet>
</template>

<script setup lang="ts">
/**
 * Gemeinsamer Drawer zum Eintragen/Bearbeiten eines Spiels (offene Spiele, Liga, Pokal, Turnier).
 * Standard: Spielersuche pro Platz. Abweichende Auswahl kommt von aussen:
 * - #player: ersetzt die Spielersuche (z.B. Liga-Team-Dropdown)
 * - #top: Inhalt ueber den Seiten (z.B. Pokal-Paarung), setzt die Seiten per setTeams
 * - lockedNames: Namen stehen fest (Turnier, Pokal), nur Treffer werden gewaehlt
 */
import { computed, ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import BottomSheet from '@/components/shared/BottomSheet.vue';
import Avatar from '@/components/shared/Avatar.vue';
import GameEntryPlayerSearch from './GameEntryPlayerSearch.vue';
import GameEntryScorePicker from './GameEntryScorePicker.vue';
import { createEmptySides, getSideName, getSideScore, type GameEntrySide } from './gameEntry';

const MAX_PLAYERS_PER_SIDE = 4;

const visible = defineModel<boolean>('visible', { default: false });

const props = withDefaults(defineProps<{
    title?: string;
    subtitle?: string;
    initialSides?: GameEntrySide[];     // Vorbelegung (Bearbeiten), sonst leer
    sideLabels?: [string, string];
    lockedNames?: boolean;
    allowExtraPlayers?: boolean;        // "+ Mitspieler" (2 gegen 2 ...)
    allowDraw?: boolean;
    maxScore?: number;
    incompleteLabel?: string;           // Button-Text, solange Namen fehlen
    avatarShape?: 'circle' | 'square';
    save: (sides: GameEntrySide[]) => Promise<boolean | void>;
    remove?: () => Promise<boolean | void>;
}>(), {
    title: 'Spiel eintragen',
    sideLabels: () => ['Seite 1', 'Seite 2'],
    allowDraw: true,
    maxScore: 21,
    incompleteLabel: 'Spieler wählen',
    avatarShape: 'circle',
});

const toast = useToast();
const sides = ref<GameEntrySide[]>(createEmptySides());
const loading = ref(false);

// Bei jedem Oeffnen und jeder neuen Vorbelegung (z.B. anderer Spieltyp) frisch aus der Vorbelegung,
// die Eingaben eines abgebrochenen Versuchs verfallen.
watch([visible, () => props.initialSides], ([isVisible]) => {
    if (isVisible)
        sides.value = props.initialSides ? JSON.parse(JSON.stringify(props.initialSides)) : createEmptySides();
}, { immediate: true });

// ─── Spieler ───
const allNames = computed(() => sides.value.flatMap(side => side.players.map(player => player.name.trim())).filter(name => name));

const getExcludedNames = (player: { name: string }) => allNames.value.filter(name => name !== player.name.trim());

const setPlayerName = (side: GameEntrySide, playerIndex: number, name: string) => {
    side.players[playerIndex].name = name;
}

// Zusaetzliche Mitspieler verschwinden ganz, der erste Platz wird nur geleert.
const clearPlayer = (side: GameEntrySide, playerIndex: number) => {
    if (playerIndex > 0)
        side.players.splice(playerIndex, 1);
    else
        side.players[0] = { name: '', score: null };
}

const canAddPlayer = (side: GameEntrySide) =>
    props.allowExtraPlayers && !props.lockedNames && side.players.length < MAX_PLAYERS_PER_SIDE;

const addPlayer = (side: GameEntrySide) => {
    side.players.push({ name: '', score: null });
}

// Fuer #top: setzt beide Seiten auf je ein Team (Treffer zurueckgesetzt).
const setTeams = (teams: { name: string; logo?: string }[]) => {
    sides.value = teams.map(team => ({ logo: team.logo, players: [{ name: team.name, score: null }] }));
}

// ─── Ergebnis ───
const totals = computed(() => sides.value.map(getSideScore));

const winnerIndex = computed(() => {
    const [score1, score2] = totals.value;
    if (score1 === null || score2 === null || score1 === score2) return -1;
    return score1 > score2 ? 0 : 1;
});

const hasAllNames = computed(() => sides.value.every(side => side.players.every(player => player.name.trim())));
const hasDuplicateNames = computed(() =>
    new Set(allNames.value.map(name => name.toLowerCase())).size !== allNames.value.length
);
const hasAllScores = computed(() => totals.value.every(total => total !== null));
const isDraw = computed(() => hasAllScores.value && totals.value[0] === totals.value[1]);

const canSave = computed(() =>
    hasAllNames.value && !hasDuplicateNames.value && hasAllScores.value && (props.allowDraw || !isDraw.value)
);

const saveLabel = computed(() => {
    if (!hasAllNames.value) return props.incompleteLabel;
    if (hasDuplicateNames.value) return 'Doppelt gewählt';
    if (!hasAllScores.value) return 'Treffer wählen';
    if (isDraw.value && !props.allowDraw) return 'Kein Unentschieden möglich';
    return `Ergebnis speichern · ${totals.value[0]} : ${totals.value[1]}`;
});

// ─── Aktionen ───
const runAction = async (action: () => Promise<boolean | void>, successMessage: string, errorMessage: string) => {
    if (loading.value) return;
    loading.value = true;
    try {
        const success = await action();
        if (success === false) throw new Error(errorMessage);
        visible.value = false;
        setTimeout(() => toast.add({ severity: 'success', summary: 'Erfolg', detail: successMessage, life: 3000 }), 400);
    } catch {
        toast.add({ severity: 'error', summary: 'Fehler', detail: errorMessage, life: 3000 });
    } finally {
        loading.value = false;
    }
}

const onSave = () => {
    if (!canSave.value) return;
    const result: GameEntrySide[] = JSON.parse(JSON.stringify(sides.value));
    runAction(() => props.save(result), 'Spiel wurde gespeichert', 'Spiel konnte nicht gespeichert werden');
}

const onDelete = () => {
    if (!props.remove || !confirm('Spiel wirklich löschen?')) return;
    runAction(props.remove, 'Spiel wurde gelöscht', 'Spiel konnte nicht gelöscht werden');
}
</script>

<style scoped>
.ge-title{
    font-size: 20px;
    font-weight: 700;
    color: #1F2328;
    line-height: 1.2;
}
.ge-subtitle{
    font-size: 13px;
    color: #6B7079;
}

.GameEntryDrawer{
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 100%;
}

/* ─── Seite ─── */
.ge-side{
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    border: 1px solid #E6E8EB;
    border-radius: 16px;
    background: white;
    transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
}
.ge-side--winner{
    border-color: var(--main-color);
    background: #FFF7F8;
    box-shadow: 0 0 0 1px var(--main-color);
}

.ge-side-header{
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 28px;
}
.ge-side-label{
    flex: 1;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: #555B63;
}
.ge-team-avatar{
    width: 32px !important;
    height: 32px !important;
    min-width: 32px;
    font-size: 12px !important;
}
.ge-team-avatar--empty{
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: #F1F2F4;
    color: #8A9099;
    font-weight: 700;
}
.ge-team-name{
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 15px;
    font-weight: 700;
    color: #1F2328;
}
.ge-team-name--empty{
    color: #9AA0A8;
    font-weight: 600;
}
.ge-win-badge{
    padding: 2px 8px;
    border-radius: 999px;
    background: var(--main-color);
    color: white;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .06em;
    text-transform: uppercase;
}
.ge-side-score{
    min-width: 24px;
    text-align: right;
    font-size: 20px;
    font-weight: 800;
    color: #1F2328;
}
.ge-side-score--empty{
    color: #B5B9C0;
    font-weight: 600;
}

/* ─── Spieler ─── */
.ge-player{
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.ge-player + .ge-player{
    padding-top: 10px;
    border-top: 1px dashed #E6E8EB;
}
.ge-player-name{
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #1F2328;
}
.ge-player-avatar{
    width: 24px !important;
    height: 24px !important;
    min-width: 24px;
    font-size: 10px !important;
}

.ge-add-player{
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 38px;
    border: 1px dashed #D3D6DB;
    border-radius: 10px;
    background: transparent;
    color: #3A3F46;
    font: inherit;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
}
.ge-add-player:hover{
    background: #F6F7F9;
}
.ge-add-player .pi{
    font-size: 11px;
}

/* ─── Footer ─── */
.ge-footer{
    position: sticky;
    bottom: 0;
    z-index: 1;
    display: flex;
    gap: 8px;
    margin-top: auto;
    padding-top: 12px;
    background: white;
}
.ge-button{
    display: flex;
    align-items: center;
    justify-content: center;
    height: 52px;
    border: none;
    border-radius: 14px;
    font: inherit;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: background .2s ease, opacity .2s ease;
}
.ge-button-save{
    flex: 1;
    background: var(--main-color);
    color: white;
}
.ge-button-save:disabled{
    background: #CDD0D6;
    cursor: default;
}
.ge-button-delete{
    width: 52px;
    min-width: 52px;
    border: 1px solid #F3C4C9;
    background: #FFF5F6;
    color: var(--main-color);
}
.ge-button-delete:hover:not(:disabled){
    background: #FDE6E9;
}
.ge-button:disabled{
    cursor: default;
}
.ge-button:focus-visible{
    outline: 2px solid #1F2328;
    outline-offset: 2px;
}
</style>
