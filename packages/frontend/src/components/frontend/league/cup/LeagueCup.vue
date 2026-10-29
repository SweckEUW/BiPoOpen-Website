<template>
    <div class="LeagueCup">

        <Loadingscreen v-if="leagueCup === undefined"/>

        <div v-else-if="leagueCup === null" class="lc-empty">
            Der League Cup startet in Kürze.
        </div>

        <template v-else>

            <!-- Rundenauswahl: Dropdown mit Pfeilen -->
            <div class="lc-round-nav" :style="{ top: stickyTop }">
                <div class="lc-arrow" :class="{ 'lc-arrow--disabled': selectedRoundIndex <= 0 }" role="button" aria-label="Vorherige Runde" @click="changeRound(-1)">
                    <i class="pi pi-chevron-left"></i>
                </div>
                <Select
                    v-model="selectedRoundIndex"
                    :options="roundOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="lc-round-select"
                    :pt="{ root: { style: '--p-select-focus-border-color: var(--main-color);' } }"
                />
                <div class="lc-arrow" :class="{ 'lc-arrow--disabled': selectedRoundIndex >= roundOptions.length - 1 }" role="button" aria-label="Nächste Runde" @click="changeRound(1)">
                    <i class="pi pi-chevron-right"></i>
                </div>
            </div>

            <template v-if="!selectedRound">
                <div class="lc-empty">
                    Die Begegnungen dieser Runde stehen noch nicht fest.
                </div>

                <!-- Naechste Runde: wer schon weiter ist, liegt im Lostopf -->
                <div v-if="potTeams.length" class="lc-group">
                    <div class="lc-group-title">
                        Im Lostopf
                        <span class="lc-count">{{ potTeams.length }}/{{ potTeamCount }}</span>
                    </div>
                    <div class="lc-team-grid">
                        <div v-for="teamName in potTeams" :key="teamName" class="lc-team">
                            <Avatar :name="teamName" :avatarImage="getLeagueTeamLogo(teamName, season.slug)" shape="square" class="lc-team-avatar" />
                            <span class="lc-team-name">{{ teamName }}</span>
                        </div>
                    </div>
                </div>
            </template>

            <template v-else>
                <div v-if="cupWinner && isFinalRound" class="lc-winner">
                    <Avatar :name="cupWinner" :avatarImage="getLeagueTeamLogo(cupWinner, season.slug)" shape="square" class="lc-winner-avatar" />
                    <div>
                        <div class="lc-winner-label">Pokalsieger</div>
                        <div class="lc-winner-name">{{ cupWinner }}</div>
                    </div>
                </div>

                <FloatingActionButton label="Spiel eintragen" :visible="canAddGame" @click="toggleModalAddGame()"/>

                <div v-if="selectedRound.byes.length" class="lc-group lc-group--byes">
                    <div class="lc-group-title">
                        Freilose
                        <span class="lc-count">{{ selectedRound.byes.length }}</span>
                    </div>
                    <div class="lc-team-grid">
                        <div v-for="teamName in selectedRound.byes" :key="teamName" class="lc-team">
                            <Avatar :name="teamName" :avatarImage="getLeagueTeamLogo(teamName, season.slug)" shape="square" class="lc-team-avatar" />
                            <span class="lc-team-name">{{ teamName }}</span>
                        </div>
                    </div>
                </div>

                <GameEntryDrawer
                    v-model:visible="showModalAddGame"
                    :subtitle="`League Cup · ${roundOptions[selectedRoundIndex]?.label ?? ''}`"
                    :sideLabels="['Team 1', 'Team 2']"
                    lockedNames
                    :allowDraw="false"
                    avatarShape="square"
                    incompleteLabel="Paarung wählen"
                    :save="saveCupGame"
                >
                    <template #top="{ setTeams }">
                        <CupPairingSelect :leagueCup="leagueCup" :roundIndex="selectedRoundIndex" :cupGames="cupGames" @select="setTeams"/>
                    </template>
                </GameEntryDrawer>

                <!-- Best-of-3: Serie pro Paarung (aufklappbar), Best-of-1: einzelne Spiele chronologisch -->
                <div v-if="playedCount" class="lc-group">
                    <div class="lc-group-title">
                        Gespielt
                        <span class="lc-count">{{ playedCount }}</span>
                    </div>
                    <template v-if="isSeriesRound">
                        <div v-for="pairing in decidedPairings" :key="pairing.team1 + pairing.team2" class="lc-series">
                            <FinalFourSeries
                                :team1="toCupTeam(pairing.team1, season.slug)"
                                :team2="toCupTeam(pairing.team2, season.slug)"
                                :leagueGames="roundGames"
                                :regularSeasonGameCount="0"
                            />
                        </div>
                    </template>
                    <MatchElement v-else v-for="match in playedGames" :key="match._id" :match="withLeagueTeamLogos(match)" :avatarShape="'square'"/>
                </div>

                <div v-if="openPairings.length" class="lc-group">
                    <div class="lc-group-title">
                        Ausstehend
                        <span class="lc-count">{{ openPairings.length }}</span>
                    </div>
                    <template v-if="isSeriesRound">
                        <div v-for="pairing in openPairings" :key="pairing.team1 + pairing.team2" class="lc-series">
                            <FinalFourSeries
                                :team1="toCupTeam(pairing.team1, season.slug)"
                                :team2="toCupTeam(pairing.team2, season.slug)"
                                :leagueGames="roundGames"
                                :regularSeasonGameCount="0"
                            />
                        </div>
                    </template>
                    <MatchElement v-else v-for="match in openPairingMatches" :key="match.team1.players[0].name" :match="match" :avatarShape="'square'"/>
                </div>
            </template>
        </template>

    </div>
</template>

<script setup lang="ts">
import { computed, PropType, ref } from 'vue';
import Select from 'primevue/select';
import Loadingscreen from '@/components/shared/Loadingscreen.vue';
import Avatar from '@/components/shared/Avatar.vue';
import FloatingActionButton from '@/components/shared/FloatingActionButton.vue';
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';
import FinalFourSeries from '../FinalFourSeries.vue';
import { useStickyTop } from '@/components/shared/useStickyStack';
import CupPairingSelect from './CupPairingSelect.vue';
import GameEntryDrawer from '@/components/shared/GameEntry/GameEntryDrawer.vue';
import { sidesToNewMatch, type GameEntrySide } from '@/components/shared/GameEntry/gameEntry';
import { addLeagueGame } from '../LeagueUtilFunctions';
import { LeagueSeason } from '../LeagueSeasonsData';
import { getLeagueTeamLogo, withLeagueTeamLogos } from '../LeaguePlayersData';
import {
    getCupGames,
    getCupRoundGames,
    getCupWinner,
    getLeagueCup,
    getPairingResult,
    getPlannedRoundNames,
    getPlannedRoundTeamCounts,
    getRemainingTeams,
    toCupPairingMatch,
    toCupTeam,
} from './LeagueCupUtilFunctions';

const props = defineProps({
    season: { type: Object as PropType<LeagueSeason>, required: true },
    allLeagueGames: { type: Array as () => Match[], required: true },
    getLeagueGames: { type: Function, required: true },
});

// undefined = laedt, null = kein Pokal fuer diese Saison
const leagueCup = ref<LeagueCup | null | undefined>(undefined);
const stickyTop = useStickyTop();
const selectedRoundIndex = ref(0);
const showModalAddGame = ref(false);

const loadLeagueCup = async () => {
    try {
        leagueCup.value = await getLeagueCup(props.season.slug);
    } catch {
        leagueCup.value = null;
    }

    // Standard: zuletzt angelegte Runde
    selectedRoundIndex.value = Math.max(0, (leagueCup.value?.rounds.length ?? 0) - 1);
}
loadLeagueCup();

// ─── Runden ───
const roundOptions = computed(() => {
    if (!leagueCup.value) return [];

    const cup = leagueCup.value;
    return getPlannedRoundNames(cup.participants.length).map((plannedName, index) => ({
        // Immer berechnen statt den gespeicherten Namen zu nehmen, damit Altdaten ("Vorrunde") nicht durchschlagen.
        label: plannedName,
        value: index,
    }));
});

const changeRound = (direction: number) => {
    const newIndex = selectedRoundIndex.value + direction;
    if (newIndex >= 0 && newIndex < roundOptions.value.length)
        selectedRoundIndex.value = newIndex;
}

const selectedRound = computed(() => leagueCup.value?.rounds[selectedRoundIndex.value]);
const isFinalRound = computed(() => selectedRoundIndex.value === roundOptions.value.length - 1);

// ─── Spiele ───
const cupGames = computed(() => leagueCup.value ? getCupGames(props.allLeagueGames, leagueCup.value) : []);
const roundGames = computed(() => getCupRoundGames(cupGames.value, selectedRoundIndex.value));
const cupWinner = computed(() => leagueCup.value ? getCupWinner(leagueCup.value, cupGames.value) : undefined);

const isSeriesRound = computed(() => (selectedRound.value?.bestOf ?? 1) > 1);

const isPairingDecided = (pairing: LeagueCupPairing) =>
    !!getPairingResult(pairing, roundGames.value, selectedRound.value?.bestOf ?? 1).winner;

const decidedPairings = computed(() => selectedRound.value?.pairings.filter(isPairingDecided) ?? []);
const openPairings = computed(() => selectedRound.value?.pairings.filter(pairing => !isPairingDecided(pairing)) ?? []);

const openPairingMatches = computed(() => openPairings.value.map(pairing => toCupPairingMatch(pairing, props.season.slug)));

const playedGames = computed(() =>
    roundGames.value.slice().sort((match1, match2) => (match1.time ?? 0) - (match2.time ?? 0))
);

// Best-of-3 zaehlt entschiedene Serien, Best-of-1 gespielte Spiele.
const playedCount = computed(() => isSeriesRound.value ? decidedPairings.value.length : playedGames.value.length);

// ─── Lostopf ───
// Nur fuer die naechste, noch nicht ausgeloste Runde: Sieger der laufenden Runde plus deren Freilose.
const isNextRound = computed(() => !!leagueCup.value && selectedRoundIndex.value === leagueCup.value.rounds.length);
const potTeams = computed(() =>
    leagueCup.value && isNextRound.value ? getRemainingTeams(leagueCup.value, cupGames.value).teams : []
);
const potTeamCount = computed(() =>
    leagueCup.value ? getPlannedRoundTeamCounts(leagueCup.value.participants.length)[selectedRoundIndex.value] ?? 0 : 0
);

// Eintragen nur in der aktuellen (zuletzt angelegten) Runde.
const canAddGame = computed(() =>
    !!leagueCup.value
    && selectedRoundIndex.value === leagueCup.value.rounds.length - 1
    && openPairings.value.length > 0
);

const toggleModalAddGame = () => {
    showModalAddGame.value = !showModalAddGame.value;
}

const saveCupGame = async (sides: GameEntrySide[]) => {
    if (!leagueCup.value) return false;
    const match = sidesToNewMatch(sides, { season: leagueCup.value.season, cupId: leagueCup.value._id, cupRound: selectedRoundIndex.value });
    const success = await addLeagueGame(match);
    if (success) await props.getLeagueGames();
    return success;
}
</script>

<style scoped>
.LeagueCup{
    padding-top: 20px;
}

.lc-empty{
    text-align: center;
    color: var(--main-color);
    opacity: 0.8;
    padding: 40px 20px;
}

/* Rundenauswahl, klebt unter der Liga-Leiste wie die Reiter in LeagueTable */
.lc-round-nav{
    position: sticky;
    z-index: 3;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 0;
    margin-bottom: 10px;
    background: white;
}
.lc-round-select{
    flex: 1;
}
:deep(.lc-round-select .p-select-label){
    text-align: center;
    font-weight: bold;
    color: var(--main-color);
}
.lc-arrow{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    min-width: 40px;
    height: 40px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    color: var(--main-color);
    cursor: pointer;
}
.lc-arrow--disabled{
    opacity: 0.3;
    pointer-events: none;
}

.lc-group{
    margin-top: 15px;
}
.lc-group--byes{
    margin-bottom: 15px;
}
.lc-group-title{
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--main-color);
    font-weight: bold;
    margin-bottom: 6px;
}
.lc-count{
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 10px;
    background: var(--main-color);
    color: white;
    font-size: 12px;
    line-height: 20px;
    text-align: center;
}

.lc-series{
    margin-top: 10px;
}

.lc-team-grid{
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 6px;
}
.lc-team{
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 8px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    color: var(--main-color);
    font-size: 14px;
    min-width: 0;
}
.lc-team .lc-team-avatar{
    width: 30px;
    height: 30px;
    min-width: 30px;
}
.lc-team-name{
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.lc-winner{
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 15px;
    margin-bottom: 15px;
    border: 2px solid var(--main-color);
    border-radius: 4px;
}
.lc-winner .lc-winner-avatar{
    width: 60px;
    height: 60px;
}
.lc-winner-label{
    font-size: 13px;
    color: var(--secondary-color);
}
.lc-winner-name{
    font-size: 20px;
    font-weight: bold;
    color: var(--main-color);
}

/* MOBILE */
@media (max-width: 900px){
    .LeagueCup{
        padding-top: 10px;
    }
    .lc-team-grid{
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
    .lc-team{
        font-size: 12px;
    }
}
</style>
