<template>
    <Modal>
        <template #title>
            <div class="ld-title">
                <span>Spielauslosung</span>
                <i class="pi pi-times ld-close" role="button" tabindex="0" aria-label="Schließen" @click="toggleModalDraw()" @keydown.enter="toggleModalDraw()"></i>
            </div>
        </template>

        <template #template>
            <div class="ld-layout">

                <!-- Rad -->
                <div class="ld-stage">
                    <div class="ld-status">
                        <template v-if="!teamA">
                            Dreh das Rad, um das erste Team auszulosen.
                        </template>
                        <template v-else-if="phase === 'team'">
                            <img :src="teamA.logo" alt="" />
                            <span><b>{{ teamA.name }}</b> ist gezogen!</span>
                        </template>
                        <template v-else>
                            <span>Gegner für</span>
                            <img :src="teamA.logo" alt="" />
                            <b>{{ teamA.name }}</b>
                        </template>
                    </div>

                    <div v-if="!wheelEntries.length" class="ld-empty">{{ emptyMessage }}</div>

                    <div v-else class="ld-wheel-area">
                        <LeagueWheel
                            :entries="wheelEntries"
                            :disabled="isRevealing || phase === 'result'"
                            @spin-start="isSpinning = true"
                            @spun="onSpun"
                        />

                        <Transition name="ld-pop">
                            <div v-if="phase === 'result' && teamA && teamB" class="ld-result">
                                <div class="ld-result-card">
                                    <div class="ld-result-title">Die Paarung steht!</div>
                                    <div class="ld-result-teams">
                                        <div class="ld-result-team">
                                            <img :src="teamA.logo" alt="" />
                                            <div class="ld-result-name">{{ teamA.name }}</div>
                                        </div>
                                        <div class="ld-result-vs">vs</div>
                                        <div class="ld-result-team">
                                            <img :src="teamB.logo" alt="" />
                                            <div class="ld-result-name">{{ teamB.name }}</div>
                                        </div>
                                    </div>
                                    <div class="bp-button ld-result-button" @click="nextPairing()">Nächste Paarung</div>
                                </div>
                            </div>
                        </Transition>
                    </div>

                    <div v-if="hiddenTeamCount" class="ld-hint">
                        {{ hiddenTeamCount }} {{ hiddenTeamCount === 1 ? 'Team hat' : 'Teams haben' }} in der {{ roundLabel }} keinen möglichen Gegner mehr und {{ hiddenTeamCount === 1 ? 'ist' : 'sind' }} ausgeblendet.
                    </div>
                </div>

                <!-- Steuerung -->
                <div class="ld-sidebar">
                    <div class="ld-section-title">Runde</div>
                    <Select
                        v-model="round"
                        :options="ROUND_OPTIONS"
                        optionLabel="label"
                        optionValue="value"
                        :disabled="controlsLocked"
                        class="w-full"
                        :pt="{ root: { style: '--p-select-focus-border-color: var(--main-color);' } }"
                    />

                    <div class="ld-section-header">
                        <div class="ld-section-title">Teilnehmer ({{ participants.size }}/{{ leaguePlayers.length }})</div>
                        <div class="ld-links" :class="{ 'ld-locked': controlsLocked }">
                            <span @click="selectAll()">Alle</span>
                            <span>·</span>
                            <span @click="selectNone()">Keine</span>
                        </div>
                    </div>

                    <div class="ld-participants" :class="{ 'ld-locked': controlsLocked }">
                        <div
                            v-for="player in leaguePlayers"
                            :key="player.name"
                            class="ld-participant"
                            :class="{ 'ld-participant-off': !participants.has(player.name) }"
                            role="checkbox"
                            tabindex="0"
                            :aria-checked="participants.has(player.name)"
                            @click="toggleParticipant(player)"
                            @keydown.space.prevent="toggleParticipant(player)"
                        >
                            <div class="ld-check"><i v-if="participants.has(player.name)" class="pi pi-check"></i></div>
                            <img :src="player.logo" alt="" />
                            <div class="ld-participant-name">{{ player.name }}</div>
                            <div v-if="removedTeams.has(player.name)" class="ld-participant-tag">ausgelost</div>
                        </div>
                    </div>

                    <template v-if="pairings.length">
                        <div class="ld-section-title">Ausgeloste Paarungen</div>
                        <div v-for="([home, away], index) in pairings" :key="index" class="ld-pairing">
                            <img :src="home.logo" alt="" />
                            <div class="ld-pairing-name">{{ home.name }}</div>
                            <div class="ld-pairing-vs">vs</div>
                            <div class="ld-pairing-name ld-pairing-name-away">{{ away.name }}</div>
                            <img :src="away.logo" alt="" />
                        </div>
                    </template>

                    <div class="ld-reset" :class="{ 'ld-locked': isSpinning || (!pairings.length && !teamA) }" @click="resetDraw()">
                        Neu starten
                    </div>
                </div>

            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/shared/Modal.vue';
import Select from 'primevue/select';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import LeagueWheel from './LeagueWheel.vue';
import { getPlayedOpponents, splitLeagueGamesByRound } from './LeagueUtilFunctions';

type Round = 'hinrunde' | 'rueckrunde';
type Phase = 'team' | 'opponent' | 'result';

const ROUND_OPTIONS: { label: string, value: Round }[] = [
    { label: 'Hinrunde', value: 'hinrunde' },
    { label: 'Rückrunde', value: 'rueckrunde' },
];

const REVEAL_DELAY = 1200;   // gezogenes Team kurz zeigen, bevor das Gegner-Rad kommt
const RESULT_DELAY = 600;

const props = defineProps({
    leaguePlayers: { type: Array as () => LeaguePlayer[], required: true },
    leagueGames: { type: Array as () => Match[], required: true },
    regularSeasonGameCount: { type: Number, required: true },
    toggleModalDraw: { type: Function, required: true }
});

// ─── Bisherige Spiele ───
// Nur die Hauptrunde zaehlt, die Final-Four-Spiele kommen danach (wie in LeagueTable).
const regularSeasonGames = computed(() => props.leagueGames.toReversed().toSpliced(props.regularSeasonGameCount));
const leagueGamesByRound = computed(() => splitLeagueGamesByRound(regularSeasonGames.value));

// Sind alle Hinrunden-Paarungen gespielt, startet die Auslosung in der Rueckrunde.
const hinrundeGameCount = props.leaguePlayers.length * (props.leaguePlayers.length - 1) / 2;
const round = ref<Round>(leagueGamesByRound.value.hinrunde.length >= hinrundeGameCount ? 'rueckrunde' : 'hinrunde');
const roundLabel = computed(() => ROUND_OPTIONS.find(option => option.value === round.value)!.label);

// Hinrunde: Gegner raus, gegen die schon 1x gespielt wurde. Rueckrunde: raus nach dem 2. Spiel.
const playedOpponents = computed(() => getPlayedOpponents(leagueGamesByRound.value[round.value]));

// ─── Auslosung ───
const participants = ref(new Set(props.leaguePlayers.map(player => player.name)));
const removedTeams = ref(new Set<string>());
const pairings = ref<[LeaguePlayer, LeaguePlayer][]>([]);
const phase = ref<Phase>('team');
const teamA = ref<LeaguePlayer | null>(null);
const teamB = ref<LeaguePlayer | null>(null);
const isSpinning = ref(false);
const isRevealing = ref(false);
let revealTimeout: ReturnType<typeof setTimeout> | undefined;

const controlsLocked = computed(() => isSpinning.value || isRevealing.value || phase.value !== 'team');

const isAvailable = (player: LeaguePlayer) =>
    participants.value.has(player.name) && !removedTeams.value.has(player.name);

const getAvailableOpponents = (team: LeaguePlayer) => {
    const played = playedOpponents.value.get(team.name.toLocaleLowerCase());
    return props.leaguePlayers.filter(opponent =>
        opponent.name !== team.name && isAvailable(opponent) && !played?.has(opponent.name.toLocaleLowerCase())
    );
}

const availableTeams = computed(() => props.leaguePlayers.filter(isAvailable));
const teamEntries = computed(() => availableTeams.value.filter(team => getAvailableOpponents(team).length > 0));
const opponentEntries = computed(() => teamA.value ? getAvailableOpponents(teamA.value) : []);
const wheelEntries = computed(() => phase.value === 'team' ? teamEntries.value : opponentEntries.value);

const hiddenTeamCount = computed(() =>
    phase.value === 'team' && teamEntries.value.length ? availableTeams.value.length - teamEntries.value.length : 0
);

const emptyMessage = computed(() =>
    participants.value.size < 2
        ? 'Wähle mindestens zwei Teams aus.'
        : `Keine weiteren Paarungen in der ${roundLabel.value} möglich.`
);

const onSpun = (entry: LeaguePlayer) => {
    isSpinning.value = false;
    isRevealing.value = true;

    if (phase.value === 'team') {
        teamA.value = entry;
        revealTimeout = setTimeout(() => {
            isRevealing.value = false;
            phase.value = 'opponent';
        }, REVEAL_DELAY);
        return;
    }

    teamB.value = entry;
    revealTimeout = setTimeout(() => {
        isRevealing.value = false;
        phase.value = 'result';
    }, RESULT_DELAY);
}

const nextPairing = () => {
    if (!teamA.value || !teamB.value) return;

    pairings.value.push([teamA.value, teamB.value]);
    removedTeams.value.add(teamA.value.name);
    removedTeams.value.add(teamB.value.name);
    teamA.value = null;
    teamB.value = null;
    phase.value = 'team';
}

const resetDraw = () => {
    if (isSpinning.value) return;

    clearTimeout(revealTimeout);
    isRevealing.value = false;
    pairings.value = [];
    removedTeams.value.clear();
    teamA.value = null;
    teamB.value = null;
    phase.value = 'team';
}

// ─── Teilnehmer ───
const toggleParticipant = (player: LeaguePlayer) => {
    if (controlsLocked.value) return;

    if (participants.value.has(player.name))
        participants.value.delete(player.name);
    else
        participants.value.add(player.name);
}

const selectAll = () => {
    if (controlsLocked.value) return;
    props.leaguePlayers.forEach(player => participants.value.add(player.name));
}

const selectNone = () => {
    if (controlsLocked.value) return;
    participants.value.clear();
}

// ─── Schliessen per Escape ───
// Offene Select-Overlays fangen Escape selbst ab und verhindern das Default.
const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && !event.defaultPrevented)
        props.toggleModalDraw();
}

onMounted(() => window.addEventListener('keydown', onKeydown));

onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown);
    clearTimeout(revealTimeout);
});
</script>

<style scoped>
:deep(.mo-container){
    width: min(1100px, 92vw);
    max-height: 92dvh;
    overflow-y: auto;
    padding: 30px 40px;
}

.ld-title{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: var(--main-color);
}
.ld-close{
    font-size: 22px;
    color: #333333;
    cursor: pointer;
    padding: 6px;
    transition: color 0.2s ease;
}
.ld-close:hover{
    color: var(--main-color);
}

.ld-layout{
    display: grid;
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 30px;
    align-items: start;
}

/* Rad */
.ld-stage{
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 0;
}
.ld-status{
    min-height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
    color: var(--main-color);
    text-align: center;
}
.ld-status img{
    width: 40px;
    height: 40px;
    object-fit: contain;
}
.ld-wheel-area{
    position: relative;
    width: 100%;
}
.ld-empty{
    width: 100%;
    padding: 60px 20px;
    text-align: center;
    color: var(--main-color);
    opacity: 0.8;
}
.ld-hint{
    margin-top: 10px;
    font-size: 14px;
    text-align: center;
    opacity: 0.7;
}

/* Ergebnis */
.ld-result{
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(2px);
}
.ld-result-card{
    width: min(440px, 100%);
    padding: 24px;
    background: white;
    border-top: 6px solid var(--main-color);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
    text-align: center;
}
.ld-result-title{
    font-size: 22px;
    color: var(--main-color);
    margin-bottom: 15px;
}
.ld-result-teams{
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}
.ld-result-team{
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}
.ld-result-team img{
    width: 80px;
    height: 80px;
    object-fit: contain;
}
.ld-result-name{
    font-size: 16px;
    overflow-wrap: anywhere;
}
.ld-result-vs{
    font-size: 26px;
    color: var(--secondary-color);
}
.ld-result-button{
    margin: 20px 0 0;
}

.ld-pop-enter-active{
    transition: opacity 0.3s ease;
}
.ld-pop-enter-active .ld-result-card{
    animation: ld-pop 0.45s cubic-bezier(0.2, 1.4, 0.4, 1);
}
.ld-pop-leave-active{
    transition: opacity 0.2s ease;
}
.ld-pop-enter-from,
.ld-pop-leave-to{
    opacity: 0;
}
@keyframes ld-pop{
    from { transform: scale(0.6); }
    to { transform: scale(1); }
}

/* Steuerung */
.ld-sidebar{
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
}
.ld-section-header{
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-top: 10px;
}
.ld-section-title{
    font-size: 16px;
    color: var(--main-color);
}
.ld-links{
    display: flex;
    gap: 6px;
    font-size: 14px;
}
.ld-links span:not(:nth-child(2)){
    cursor: pointer;
    color: var(--secondary-color);
}

.ld-participants{
    display: flex;
    flex-direction: column;
    max-height: 360px;
    overflow-y: auto;
    border: 1px solid #E5E5E5;
}
.ld-participant{
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 10px;
    border-bottom: 1px solid #F0F0F0;
    cursor: pointer;
    transition: background 0.2s ease, opacity 0.2s ease;
}
.ld-participant:last-child{
    border-bottom: none;
}
.ld-participant:hover{
    background: var(--secondary-color-weak);
}
.ld-participant-off{
    opacity: 0.45;
}
.ld-check{
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--main-color);
    color: white;
}
.ld-participant:not(.ld-participant-off) .ld-check{
    background: var(--main-color);
}
.ld-check .pi{
    font-size: 11px;
}
.ld-participant img,
.ld-pairing img{
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    object-fit: contain;
}
.ld-participant-name{
    flex: 1;
    min-width: 0;
    font-size: 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.ld-participant-tag{
    font-size: 12px;
    color: var(--secondary-color);
    white-space: nowrap;
}

.ld-pairing{
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    border-bottom: 1px solid #F0F0F0;
}
.ld-pairing-name{
    flex: 1;
    min-width: 0;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.ld-pairing-name-away{
    text-align: right;
}
.ld-pairing-vs{
    font-size: 14px;
    color: var(--secondary-color);
}

.ld-reset{
    margin-top: 10px;
    padding: 12px;
    text-align: center;
    border: 1px solid var(--main-color);
    color: var(--main-color);
    cursor: pointer;
    transition: background 0.2s ease;
}
.ld-reset:hover{
    background: var(--main-color-hover);
}

.ld-locked{
    opacity: 0.4;
    pointer-events: none;
}

/* MOBILE */
@media (max-width: 900px){
    :deep(.mo-container){
        padding: 20px 12px;
    }
    .ld-layout{
        grid-template-columns: minmax(0, 1fr);
        gap: 20px;
    }
    .ld-participants{
        max-height: 260px;
    }
}
</style>
