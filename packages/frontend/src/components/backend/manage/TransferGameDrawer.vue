<template>
    <BottomSheet v-model:visible="visible">
        <template #header>
            <div>
                <div class="tg-title">Spiel übertragen</div>
                <div class="tg-subtitle">{{ subtitle }}</div>
            </div>
        </template>

        <div v-if="entry" class="TransferGameDrawer">
            <!-- Ziel: Spielart, darunter Liga bzw. Pokalrunde -->
            <div>
                <div class="tg-label">Übertragen nach</div>
                <div class="tg-segment" role="radiogroup" aria-label="Übertragen nach">
                    <button v-for="option in TARGETS" :key="option.value"
                        type="button"
                        role="radio"
                        class="tg-segment-option"
                        :class="{ 'tg-segment-option--active': target === option.value }"
                        :aria-checked="target === option.value"
                        :disabled="option.value === entry.type"
                        @click="target = option.value"
                    >
                        <span class="tg-dot" :class="`tg-dot--${option.value}`"></span>{{ option.label }}
                    </button>
                </div>
            </div>

            <div v-if="target === 'league'" class="tg-segment" role="radiogroup" aria-label="Liga">
                <button v-for="division in season?.divisions ?? []" :key="division.league"
                    type="button"
                    role="radio"
                    class="tg-segment-option"
                    :class="{ 'tg-segment-option--active': selectedLeague === division.league }"
                    :aria-checked="selectedLeague === division.league"
                    @click="selectedLeague = division.league"
                >{{ division.label }}</button>
            </div>

            <template v-if="target === 'cup'">
                <div v-if="cupLoading" class="bp-skeleton tg-skeleton"></div>
                <div v-else-if="!leagueCup?.rounds.length" class="tg-note">
                    In der Saison {{ season?.label ?? seasonSlug }} gibt es noch keine Pokalrunde.
                </div>
                <div v-else class="tg-segment tg-segment--wrap" role="radiogroup" aria-label="Pokalrunde">
                    <button v-for="(round, roundIndex) in leagueCup.rounds" :key="roundIndex"
                        type="button"
                        role="radio"
                        class="tg-segment-option"
                        :class="{ 'tg-segment-option--active': selectedRound === roundIndex }"
                        :aria-checked="selectedRound === roundIndex"
                        @click="selectedRound = roundIndex"
                    >{{ roundNames[roundIndex] ?? round.name }}</button>
                </div>
            </template>

            <!-- Pro Seite: wer es vorher war und wer es jetzt ist -->
            <div v-for="(side, sideIndex) in sides" :key="sideIndex"
                class="tg-side"
                :class="{ 'tg-side--winner': winnerIndex === sideIndex }"
            >
                <div class="tg-side-header">
                    <span class="tg-side-label">Team {{ sideIndex + 1 }}</span>
                    <span v-if="winnerIndex === sideIndex" class="tg-win-badge">Sieg</span>
                    <span class="tg-side-score" :class="{ 'tg-side-score--empty': side.score === null }">{{ side.score ?? '—' }}</span>
                </div>

                <div class="tg-from">
                    war <s class="tg-from-name">{{ side.from }}</s> → {{ TARGET_NAME_LABELS[target] }}:
                </div>

                <GameEntryPlayerSearch
                    v-if="target === 'open'"
                    :modelValue="side.name"
                    :excludedNames="getOtherNames(sideIndex)"
                    placeholder="Spieler suchen …"
                    @update:modelValue="name => side.name = name"
                    @clear="side.name = ''"
                />
                <LeagueTeamSelect
                    v-else
                    :modelValue="side.name"
                    :teams="teamOptions"
                    :excludedNames="getOtherNames(sideIndex)"
                    @update:modelValue="name => side.name = name"
                />

                <GameEntryScorePicker
                    v-model="side.score"
                    :disabled="scoresLocked"
                    :label="`Treffer ${side.name || `Team ${sideIndex + 1}`}`"
                />
            </div>

            <div v-if="scoresLocked" class="tg-hint">🔒 Treffer kommen aus den {{ turnCount }} Würfen</div>

            <div v-if="warning" class="tg-warning" role="alert">
                <i class="pi pi-exclamation-triangle"></i>
                <span>{{ warning }}</span>
            </div>

            <!-- Optionen -->
            <div class="tg-options">
                <button v-if="turnCount" type="button" role="switch" class="tg-toggle" :aria-checked="keepTurns" @click="keepTurns = !keepTurns">
                    <span class="tg-toggle-text">
                        Würfe & Spielverlauf mitnehmen
                        <small>Grafik, Highlights, Auszeichnungen bleiben</small>
                    </span>
                    <span class="tg-switch" aria-hidden="true"></span>
                </button>
                <button type="button" role="switch" class="tg-toggle" :aria-checked="deleteSource" @click="deleteSource = !deleteSource">
                    <span class="tg-toggle-text">
                        {{ GAME_LABELS[entry.type] }} danach löschen
                        <small>Sonst steht es doppelt drin</small>
                    </span>
                    <span class="tg-switch" aria-hidden="true"></span>
                </button>
                <button type="button" role="switch" class="tg-toggle" :aria-checked="sendPush" @click="sendPush = !sendPush">
                    <span class="tg-toggle-text">
                        Push senden
                        <small>Wie bei einem neuen {{ PUSH_LABELS[target] }}</small>
                    </span>
                    <span class="tg-switch" aria-hidden="true"></span>
                </button>
            </div>

            <div class="tg-footer">
                <button type="button" class="tg-save" :disabled="!!blocker || saving" @click="save()">
                    <i v-if="saving" class="pi pi-spin pi-spinner"></i>
                    <template v-else>
                        <i v-if="!blocker" class="pi pi-arrow-right-arrow-left"></i>
                        {{ saveLabel }}
                    </template>
                </button>
            </div>
        </div>
    </BottomSheet>
</template>

<script setup lang="ts">
/**
 * Bestehendes Spiel in eine andere Spielart uebertragen (offen <-> Liga <-> Pokal).
 * Das Spiel wird in der Zielart neu angelegt, die Seiten bekommen dort Spieler bzw. Liga-Teams
 * (vorgeschlagen ueber den Spieler hinter dem Team). Auf Wunsch wird das alte Spiel danach geloescht.
 */
import { computed, ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import BottomSheet from '@/components/shared/BottomSheet.vue';
import GameEntryPlayerSearch from '@/components/shared/GameEntry/GameEntryPlayerSearch.vue';
import GameEntryScorePicker from '@/components/shared/GameEntry/GameEntryScorePicker.vue';
import LeagueTeamSelect from '@/components/frontend/league/LeagueTeamSelect.vue';
import { getSideName, getSideScore, isImpossibleScore, matchToSides, type GameEntrySide } from '@/components/shared/GameEntry/gameEntry';
import { addOpenGame, deleteOpenGame } from '@/components/frontend/openGames/OpenGamesUtilFunctions';
import { addLeagueGame, deleteLeagueGame, getGameLeague, getGameSeason } from '@/components/frontend/league/LeagueUtilFunctions';
import { CURRENT_SEASON_SLUG, getSeason, toLeaguePlayers } from '@/components/frontend/league/LeagueSeasonsData';
import { getLeagueTeamLogo, getPlayerForLeagueTeam } from '@/components/frontend/league/LeaguePlayersData';
import { getLeagueCup, getPlannedRoundNames } from '@/components/frontend/league/cup/LeagueCupUtilFunctions';
import { formatResultDay, type GameType, type ResultEntry } from '@/components/frontend/results/resultsUtil';
import { formatGameClock } from '@/util/util';

const TARGETS: { label: string; value: GameType }[] = [
    { label: 'Offen', value: 'open' },
    { label: 'Liga', value: 'league' },
    { label: 'Cup', value: 'cup' },
];
const GAME_LABELS: Record<GameType, string> = { open: 'Offenes Spiel', league: 'Ligaspiel', cup: 'Pokalspiel' };
const PUSH_LABELS: Record<GameType, string> = { open: 'offenen Spiel', league: 'Ligaspiel', cup: 'Pokalspiel' };
const SAVE_LABELS: Record<GameType, string> = { open: 'Als offenes Spiel speichern', league: 'Als Ligaspiel speichern', cup: 'Als Pokalspiel speichern' };
const TARGET_NAME_LABELS: Record<GameType, string> = { open: 'Spieler', league: 'Liga-Team', cup: 'Pokal-Team' };
// Naheliegendes Ziel beim Oeffnen
const DEFAULT_TARGETS: Record<GameType, GameType> = { open: 'league', league: 'open', cup: 'league' };

const props = defineProps<{ entry?: ResultEntry }>();
const emit = defineEmits<{ transferred: [] }>();
const visible = defineModel<boolean>('visible', { default: false });

const toast = useToast();

// Eine Seite im Ziel hat immer genau einen Namen: Liga-/Pokal-Team oder ein Spieler.
// persons: die Personen hinter der Seite, daraus kommen die Vorschlaege
type TransferSide = { from: string; sourceTeam: string; persons: string[]; name: string; score: number | null; originalScore: number | null };

const target = ref<GameType>('league');
const selectedLeague = ref(1);
const selectedRound = ref(0);
const keepTurns = ref(true);
const deleteSource = ref(true);
const sendPush = ref(false);
const saving = ref(false);
const sides = ref<TransferSide[]>([]);

// Liga-/Pokalspiele bleiben in ihrer Saison, offene Spiele kommen in die aktuelle
const seasonSlug = computed(() => props.entry && props.entry.type !== 'open' ? getGameSeason(props.entry.match) : CURRENT_SEASON_SLUG);
const season = computed(() => getSeason(seasonSlug.value));

const turnCount = computed(() => props.entry?.match.turns?.length ?? 0);
const scoresLocked = computed(() => keepTurns.value && turnCount.value > 0);

const subtitle = computed(() => {
    const match = props.entry?.match;
    if (!props.entry || !match) return '';
    return [
        `von ${GAME_LABELS[props.entry.type]}`,
        match.time ? formatResultDay(match.time) : '',
        match.time ? formatGameClock(match.time) : '',
        turnCount.value ? `${turnCount.value} Würfe` : '',
    ].filter(part => part).join(' · ');
});

// ─── Pokal ───
const leagueCup = ref<LeagueCup | null>(null);
const cupLoading = ref(false);
// Eine Anfrage pro Saison, auch wenn loadCup kurz hintereinander mehrfach laeuft
let cupRequest: Promise<LeagueCup | null> | undefined;
let cupRequestSeason: string | undefined;

const roundNames = computed(() => leagueCup.value ? getPlannedRoundNames(leagueCup.value.participants.length) : []);

const findPairing = (roundIndex: number) => {
    const names = sides.value.map(side => side.name.trim().toLowerCase());
    return leagueCup.value?.rounds[roundIndex]?.pairings.find(pairing =>
        [pairing.team1, pairing.team2].every(team => names.includes(team.toLowerCase())));
};

// Neueste Runde, in der die beiden Teams gegeneinander spielen, sonst die aktuelle Runde
const suggestRound = () => {
    const rounds = leagueCup.value?.rounds ?? [];
    for (let index = rounds.length - 1; index >= 0; index--)
        if (findPairing(index)) return index;
    return Math.max(0, rounds.length - 1);
};

const loadCup = async () => {
    const slug = seasonSlug.value;
    if (cupRequestSeason !== slug) {
        cupRequestSeason = slug;
        cupLoading.value = true;
        // Fehler nicht merken: beim naechsten Mal neu versuchen
        cupRequest = getLeagueCup(slug).catch(() => {
            cupRequestSeason = undefined;
            return null;
        });
    }
    leagueCup.value = await cupRequest!;
    cupLoading.value = false;
    if (target.value !== 'cup') return;
    applySuggestions();
    selectedRound.value = suggestRound();
};

// ─── Auswahl und Vorschlaege ───
const teamOptions = computed<LeaguePlayer[]>(() => {
    if (target.value === 'cup')
        return (leagueCup.value?.participants ?? []).map(participant => ({
            name: participant.teamName,
            logo: getLeagueTeamLogo(participant.teamName, seasonSlug.value) ?? '',
        }));
    if (target.value === 'league')
        return toLeaguePlayers(season.value?.divisions.find(division => division.league === selectedLeague.value)?.teams ?? []);
    return [];
});

const sameName = (first: string, second: string) => first.trim().toLowerCase() === second.trim().toLowerCase();

// Gleiches Team (Liga <-> Pokal), sonst das Team, hinter dem einer der Spieler steht
const suggestTeam = (side: TransferSide, teamNames: string[]) =>
    teamNames.find(team => side.sourceTeam && sameName(team, side.sourceTeam))
    ?? teamNames.find(team => side.persons.some(person => sameName(getPlayerForLeagueTeam(team) ?? '', person)))
    ?? '';

// Liga, in der die meisten Seiten ein Team haben (z.B. beide Spieler in der 1. Liga)
const suggestLeague = () => {
    const divisions = season.value?.divisions ?? [];
    let best = props.entry?.type === 'league' ? getGameLeague(props.entry.match) : divisions[0]?.league ?? 1;
    let bestCount = 0;
    divisions.forEach((division) => {
        const teamNames = division.teams.map(team => team.teamName);
        const count = sides.value.filter(side => suggestTeam(side, teamNames)).length;
        if (count > bestCount) {
            best = division.league;
            bestCount = count;
        }
    });
    return best;
};

const applySuggestions = () => {
    const teamNames = teamOptions.value.map(team => team.name);
    sides.value.forEach((side) => {
        side.name = target.value === 'open' ? side.persons[0] ?? '' : suggestTeam(side, teamNames);
    });
    if (sides.value[0]?.name && sameName(sides.value[0].name, sides.value[1]?.name ?? '')) sides.value[1].name = '';
};

const prepareTarget = () => {
    if (target.value === 'league') selectedLeague.value = suggestLeague();
    if (target.value === 'cup') loadCup();
    else applySuggestions();
};

watch(target, prepareTarget);
watch(selectedLeague, () => { if (target.value === 'league') applySuggestions(); });

// Treffer kommen wieder aus den Wuerfen, sobald sie mitgenommen werden
watch(scoresLocked, (locked) => {
    if (locked) sides.value.forEach(side => side.score = side.originalScore);
});

// Persons hinter einer Seite: offene Spiele sind die Spieler selbst, Liga/Pokal der Spieler hinter dem Team
const getPersons = (entry: ResultEntry, side: GameEntrySide) => entry.type === 'open'
    ? side.players.map(player => player.name.trim()).filter(name => name)
    : side.players.map(player => getPlayerForLeagueTeam(player.name) ?? player.name);

// Bei jedem Oeffnen frisch aus dem Spiel
watch([visible, () => props.entry], ([isVisible]) => {
    const entry = props.entry;
    if (!isVisible || !entry) return;
    sides.value = matchToSides(entry.match).map((side) => {
        const score = getSideScore(side);
        return {
            from: getSideName(side),
            sourceTeam: entry.type === 'open' ? '' : side.players[0]?.name ?? '',
            persons: getPersons(entry, side),
            name: '',
            score,
            originalScore: score,
        };
    });
    keepTurns.value = true;
    deleteSource.value = true;
    sendPush.value = false;
    saving.value = false;
    target.value = DEFAULT_TARGETS[entry.type];
    prepareTarget();
}, { immediate: true });

const getOtherNames = (sideIndex: number) =>
    sides.value.filter((_, index) => index !== sideIndex).map(side => side.name.trim()).filter(name => name);

// ─── Pruefung ───
const scores = computed(() => sides.value.map(side => side.score));
const hasAllNames = computed(() => sides.value.every(side => side.name.trim()));
const hasAllScores = computed(() => scores.value.every(score => score !== null));
const isDraw = computed(() => hasAllScores.value && scores.value[0] === scores.value[1]);
const isImpossible = computed(() => hasAllScores.value && isImpossibleScore(scores.value[0]!, scores.value[1]!));

const winnerIndex = computed(() => {
    if (!hasAllScores.value || isDraw.value) return -1;
    return scores.value[0]! > scores.value[1]! ? 0 : 1;
});

const hasCupRound = computed(() => !!leagueCup.value?.rounds.length);
const isPairingMissing = computed(() =>
    target.value === 'cup' && hasCupRound.value && hasAllNames.value && !findPairing(selectedRound.value));

const warning = computed(() => {
    if (isImpossible.value) return 'Unmöglicher Spielstand. Bis 10 gespielt, mehr nur in der Verlängerung (je 3 Becher).';
    if (isPairingMissing.value) return `Die beiden Teams spielen in der ${roundNames.value[selectedRound.value] ?? 'Runde'} nicht gegeneinander. Das Spiel würde im Pokal nicht zählen.`;
    return '';
});

// Grund, warum nicht gespeichert werden kann (steht dann auf dem Button)
const blocker = computed(() => {
    if (target.value === 'cup' && cupLoading.value) return 'Pokal wird geladen …';
    if (target.value === 'cup' && !hasCupRound.value) return 'Keine Pokalrunde';
    if (!hasAllNames.value) return target.value === 'open' ? 'Spieler wählen' : 'Teams wählen';
    if (sameName(sides.value[0].name, sides.value[1].name)) return 'Doppelt gewählt';
    if (!hasAllScores.value) return 'Treffer wählen';
    if (isImpossible.value) return `Unmöglicher Spielstand · ${scores.value[0]} : ${scores.value[1]}`;
    if (isDraw.value && target.value === 'cup') return 'Kein Unentschieden möglich';
    if (isPairingMissing.value) return 'Keine Paarung dieser Runde';
    return null;
});

const saveLabel = computed(() => blocker.value ?? `${SAVE_LABELS[target.value]} · ${scores.value[0]} : ${scores.value[1]}`);

// ─── Speichern ───
const buildMatch = (): Match => {
    const source = props.entry!.match;
    const toTeam = (side: TransferSide, team: Team): Team => ({
        _id: team._id,
        players: [{ _id: team.players[0]?._id ?? 'placeholder', name: side.name.trim(), score: side.score ?? 0 }],
    });

    const match: Match = {
        _id: 'placeholder',
        time: source.time,
        referee: source.referee,
        team1: toTeam(sides.value[0], source.team1),
        team2: toTeam(sides.value[1], source.team2),
    };

    // Im Ziel hat jede Seite genau einen Spieler: Wuerfe aus dem Doppel gehoeren dann zum Team
    if (scoresLocked.value) {
        match.turns = source.turns!.map(turn => ({ ...turn, playerIndex: 0 }));
        match.events = source.events;
        match.endTime = source.endTime;
        match.cupColors = source.cupColors;
    }

    if (target.value === 'league') {
        match.season = seasonSlug.value;
        match.league = selectedLeague.value;
    }
    if (target.value === 'cup' && leagueCup.value) {
        match.season = leagueCup.value.season;
        match.cupId = leagueCup.value._id;
        match.cupRound = selectedRound.value;
    }
    return match;
};

const save = async () => {
    if (blocker.value || saving.value || !props.entry) return;
    const entry = props.entry;
    const targetType = target.value;
    const match = buildMatch();
    const result = `${sides.value[0].name.trim()} ${scores.value[0]} : ${scores.value[1]} ${sides.value[1].name.trim()}`;

    saving.value = true;
    try {
        const added = targetType === 'open'
            ? await addOpenGame(match, { push: sendPush.value })
            : await addLeagueGame(match, { push: sendPush.value });
        if (!added) throw new Error();
    } catch {
        saving.value = false;
        toast.add({ severity: 'error', summary: 'Spiel nicht übertragen', life: 3000 });
        return;
    }

    // Erst nach dem Anlegen loeschen, damit bei einem Fehler nichts verloren geht
    let deleted = true;
    if (deleteSource.value) {
        try {
            deleted = await (entry.type === 'open' ? deleteOpenGame(entry.match) : deleteLeagueGame(entry.match));
        } catch {
            deleted = false;
        }
    }

    saving.value = false;
    visible.value = false;
    emit('transferred');
    setTimeout(() => toast.add(deleted
        ? { severity: 'success', summary: `Als ${GAME_LABELS[targetType]} übertragen`, detail: result, life: 3000 }
        : { severity: 'warn', summary: 'Übertragen, altes Spiel nicht gelöscht', detail: 'Bitte das alte Spiel von Hand löschen.', life: 5000 }
    ), 400);
};
</script>

<style scoped>
.tg-title{
    font-size: 20px;
    font-weight: 700;
    color: var(--bp-text-strong);
    line-height: 1.2;
}
.tg-subtitle{
    font-size: 13px;
    color: var(--bp-text-muted);
}

.TransferGameDrawer{
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 100%;
}
.tg-label{
    margin-bottom: 6px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--bp-text-secondary);
}

/* ─── Segmente (Spielart, Liga, Runde) ─── */
.tg-segment{
    display: flex;
    gap: 4px;
    padding: 4px;
    border-radius: 12px;
    background: var(--bp-fill);
}
.tg-segment--wrap{
    flex-wrap: wrap;
}
.tg-segment-option{
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 36px;
    padding: 4px 10px;
    border: none;
    border-radius: 9px;
    background: transparent;
    color: var(--bp-text-secondary);
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background .2s ease, color .2s ease;
}
.tg-segment-option--active{
    background: var(--bp-surface);
    color: var(--bp-text-strong);
    box-shadow: 0 1px 3px rgba(0, 0, 0, .08);
}
.tg-segment-option:disabled{
    opacity: .4;
    cursor: default;
}
.tg-dot{
    width: 7px;
    height: 7px;
    border-radius: 50%;
}
.tg-dot--open{ background: var(--bp-text-subtle); }
.tg-dot--league{ background: var(--secondary-color); }
.tg-dot--cup{ background: var(--main-color); }

.tg-skeleton{
    height: 44px;
    border-radius: 12px;
}
.tg-note{
    padding: 10px 12px;
    border-radius: 12px;
    background: var(--bp-fill-soft);
    color: var(--bp-text-muted);
    font-size: 14px;
}

/* ─── Seite ─── */
.tg-side{
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    border: 1px solid var(--bp-border);
    border-radius: 16px;
    background: var(--bp-surface);
    transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
}
.tg-side--winner{
    border-color: var(--main-color);
    background: var(--bp-primary-faint);
    box-shadow: 0 0 0 1px var(--main-color);
}
.tg-side-header{
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 28px;
}
.tg-side-label{
    flex: 1;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--bp-text-secondary);
}
.tg-win-badge{
    padding: 2px 8px;
    border-radius: 999px;
    background: var(--main-color);
    color: white;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .06em;
    text-transform: uppercase;
}
.tg-side-score{
    min-width: 24px;
    text-align: right;
    font-size: 20px;
    font-weight: 800;
    color: var(--bp-text-strong);
}
.tg-side-score--empty{
    color: var(--bp-text-faint);
    font-weight: 600;
}
.tg-from{
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--bp-text-muted);
}
.tg-from-name{
    padding: 1px 8px;
    border-radius: 6px;
    background: var(--bp-fill);
    color: var(--bp-text-secondary);
    font-weight: 700;
}

.tg-hint{
    font-size: 13px;
    color: var(--bp-text-muted);
}
.tg-warning{
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 12px 14px;
    border-radius: 14px;
    background: color-mix(in srgb, #E5484D 12%, transparent);
    color: var(--bp-text);
    font-size: 14px;
    line-height: 1.4;
}
.tg-warning .pi{
    margin-top: 2px;
    color: #E5484D;
}

/* ─── Optionen ─── */
.tg-options{
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--bp-border);
    border-radius: 16px;
    background: var(--bp-surface);
}
.tg-toggle{
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 56px;
    padding: 8px 14px;
    border: none;
    border-bottom: 1px solid var(--bp-border);
    background: transparent;
    color: var(--bp-text-strong);
    font: inherit;
    font-size: 15px;
    font-weight: 700;
    text-align: left;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
}
.tg-toggle:last-child{
    border-bottom: none;
}
.tg-toggle-text{
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
}
.tg-toggle-text small{
    font-size: 12px;
    font-weight: 500;
    color: var(--bp-text-muted);
}
.tg-switch{
    position: relative;
    flex-shrink: 0;
    width: 44px;
    height: 26px;
    border-radius: 999px;
    background: var(--bp-fill-strong);
    transition: background .2s ease;
}
.tg-switch::after{
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, .25);
    transition: transform .2s ease;
}
.tg-toggle[aria-checked="true"] .tg-switch{
    background: var(--main-color);
}
.tg-toggle[aria-checked="true"] .tg-switch::after{
    transform: translateX(18px);
}

/* ─── Footer ─── */
.tg-footer{
    position: sticky;
    bottom: 0;
    z-index: 1;
    margin-top: auto;
    padding-top: 12px;
    background: var(--bp-surface);
}
.tg-save{
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    min-height: 52px;
    padding: 6px 12px;
    border: none;
    border-radius: 14px;
    background: var(--main-color);
    color: white;
    font: inherit;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: background .2s ease;
}
.tg-save:disabled{
    background: var(--bp-border-strong);
    cursor: default;
}
.tg-save:focus-visible{
    outline: 2px solid var(--bp-text-strong);
    outline-offset: 2px;
}
</style>
