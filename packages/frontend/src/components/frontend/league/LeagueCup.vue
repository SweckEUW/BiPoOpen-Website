<template>
    <div class="LeagueCup">

        <Loadingscreen v-if="leagueCup === undefined"/>

        <div v-else-if="leagueCup === null" class="lc-empty">
            Der League Cup startet in Kürze.
        </div>

        <template v-else>

            <!-- Rundenauswahl: Dropdown mit Pfeilen -->
            <div class="lc-round-nav">
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

            <div v-if="!selectedRound" class="lc-empty">
                Die Begegnungen dieser Runde stehen noch nicht fest.
            </div>

            <template v-else>
                <div v-if="cupWinner && isFinalRound" class="lc-winner">
                    <Avatar :name="cupWinner" :avatarImage="getLeagueTeamLogo(cupWinner, season.slug)" shape="square" class="lc-winner-avatar" />
                    <div>
                        <div class="lc-winner-label">Pokalsieger</div>
                        <div class="lc-winner-name">{{ cupWinner }}</div>
                    </div>
                </div>

                <div v-if="canAddGame" class="bp-button" @click="toggleModalAddGame()">Spiel eintragen</div>

                <div v-if="selectedRound.byes.length" class="lc-group lc-group--byes">
                    <div class="lc-group-title">Freilose</div>
                    <div class="lc-byes">
                        <div v-for="teamName in selectedRound.byes" :key="teamName" class="lc-bye">
                            <Avatar :name="teamName" :avatarImage="getLeagueTeamLogo(teamName, season.slug)" shape="square" class="lc-bye-avatar" />
                            <span class="lc-bye-name">{{ teamName }}</span>
                        </div>
                    </div>
                </div>

                <Teleport to="body">
                    <Transition name="fade">
                        <ModalAddCupGame v-if="showModalAddGame"
                            :leagueCup="leagueCup"
                            :roundIndex="selectedRoundIndex"
                            :cupGames="cupGames"
                            :toggleModal="toggleModalAddGame"
                            :getLeagueGames="getLeagueGames"
                        />
                    </Transition>
                </Teleport>

                <!-- Best-of-3: Serie pro Paarung, aufklappbar -->
                <template v-if="selectedRound.bestOf > 1">
                    <div v-for="pairing in selectedRound.pairings" :key="pairing.team1 + pairing.team2" class="lc-series">
                        <FinalFourSeries
                            :team1="toCupTeam(pairing.team1, season.slug)"
                            :team2="toCupTeam(pairing.team2, season.slug)"
                            :leagueGames="roundGames"
                            :regularSeasonGameCount="0"
                        />
                    </div>
                </template>

                <!-- Best-of-1: erst gespielte Spiele (chronologisch), dann offene Paarungen -->
                <div v-else class="lc-matches">
                    <MatchElement v-for="match in playedGames" :key="match._id" :match="withLeagueTeamLogos(match)" :avatarShape="'square'"/>
                    <MatchElement v-for="match in openPairingMatches" :key="match.team1.players[0].name" :match="match" :avatarShape="'square'"/>
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
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';
import FinalFourSeries from './FinalFourSeries.vue';
import ModalAddCupGame from './ModalAddCupGame.vue';
import { LeagueSeason } from './LeagueSeasonsData';
import { getLeagueTeamLogo, withLeagueTeamLogos } from './LeaguePlayersData';
import {
    getCupGames,
    getCupRoundGames,
    getCupWinner,
    getLeagueCup,
    getPairingResult,
    getPlannedRoundNames,
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

const openPairings = computed(() => {
    const round = selectedRound.value;
    if (!round) return [];
    return round.pairings.filter(pairing => !getPairingResult(pairing, roundGames.value, round.bestOf).winner);
});

const openPairingMatches = computed(() => openPairings.value.map(pairing => toCupPairingMatch(pairing, props.season.slug)));

const playedGames = computed(() =>
    roundGames.value.slice().sort((match1, match2) => (match1.time ?? 0) - (match2.time ?? 0))
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
    top: calc(205px + var(--league-sticky-extra, 0px));
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
.lc-matches{
    margin-top: 15px;
}
.lc-group-title{
    color: var(--main-color);
    font-weight: bold;
    margin-bottom: 6px;
}

.lc-series{
    margin-top: 10px;
}

.lc-byes{
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 6px;
}
.lc-bye{
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
.lc-bye .lc-bye-avatar{
    width: 30px;
    height: 30px;
    min-width: 30px;
}
.lc-bye-name{
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
    .lc-round-nav{
        top: calc(125px + var(--league-sticky-extra, 0px));
    }
    .lc-byes{
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
    .lc-bye{
        font-size: 12px;
    }
}
</style>
