<template>
    <div class="Manage">
        <header class="mn-head">
            <h1 class="mn-title">Verwaltung</h1>
            <p class="mn-subtitle">Alle Spiele · neueste zuerst</p>
        </header>

        <!-- Suche: Spieler- oder Teamname -->
        <div class="mn-search">
            <i class="pi pi-search mn-search-icon"></i>
            <input
                v-model="query"
                class="mn-search-input"
                type="search"
                placeholder="Spieler oder Team suchen"
                aria-label="Spieler oder Team suchen"
                autocomplete="off"
                enterkeyhint="search"
                @keydown.esc="query = ''"
            />
            <button v-if="query" type="button" class="mn-search-clear" aria-label="Suche löschen" @click="query = ''">
                <i class="pi pi-times"></i>
            </button>
        </div>

        <Tabs v-model:value="activeFilter" class="p-tabs-chips">
            <TabList class="mn-filter">
                <Tab v-for="filter in FILTERS" :key="filter.value" :value="filter.value">{{ filter.label }}</Tab>
            </TabList>
        </Tabs>

        <!-- Spieleliste scrollt in sich, damit "Weitere Verwaltung" darunter stehen bleibt -->
        <div class="mn-list">
            <div v-if="loading" aria-busy="true" class="mn-list-skeleton">
                <div v-for="i in 6" :key="i" class="bp-skeleton mn-skeleton-row"></div>
            </div>

            <div v-else-if="!filteredGames.length" class="mn-empty">
                {{ query.trim() ? `Keine Spiele mit „${query.trim()}“` : 'Keine Spiele' }}
            </div>

            <template v-else>
                <MatchElement
                    v-for="entry in visibleGames"
                    :key="entry.match._id"
                    :match="entry.match"
                    :gameType="entry.type"
                    showChip
                    timestamp="date"
                    compact
                    class="mn-game"
                    :class="{ 'mn-game--open': expandedId === entry.match._id }"
                >
                    <template #meta>
                        <button type="button" class="mn-menu" :aria-expanded="expandedId === entry.match._id" aria-label="Aktionen" @click="toggleExpanded(entry.match._id)">
                            <i class="pi pi-ellipsis-h"></i>
                        </button>
                    </template>
                    <template v-if="expandedId === entry.match._id" #bottom>
                        <div class="mn-actions">
                            <button type="button" class="mn-action" @click="openEdit(entry)">
                                <i class="pi pi-pencil"></i> Bearbeiten
                            </button>
                            <button type="button" class="mn-action" @click="openTransfer(entry)">
                                <i class="pi pi-arrow-right-arrow-left"></i> Übertragen
                            </button>
                            <button type="button" class="mn-action mn-action--danger" @click="removeGame(entry)">
                                <i class="pi pi-trash"></i> Löschen
                            </button>
                        </div>
                    </template>
                </MatchElement>

                <button v-if="visibleGames.length < filteredGames.length" type="button" class="bp-more-button mn-more" @click="visibleCount += PAGE_SIZE">
                    Mehr laden
                </button>
            </template>
        </div>

        <section class="mn-more-section">
            <h2 class="mn-section-title">Weitere Verwaltung</h2>
            <div class="mn-card">
                <router-link v-for="link in MORE_LINKS" :key="link.to" :to="link.to" class="mn-link">
                    <span class="mn-link-icon" aria-hidden="true">{{ link.icon }}</span>
                    <span class="mn-link-text">
                        <span class="mn-link-title">{{ link.title }}</span>
                        <span class="mn-link-subtitle">{{ link.subtitle }}</span>
                    </span>
                    <i class="pi pi-chevron-right mn-link-chevron"></i>
                </router-link>
            </div>
        </section>

        <!-- Bearbeiten: je nach Spielart offene Spieler oder Liga-/Pokalteams -->
        <GameEntryDrawer
            v-model:visible="editVisible"
            title="Spiel bearbeiten"
            :subtitle="editSubtitle"
            :initialSides="editSides"
            :sideLabels="editEntry?.type === 'open' ? undefined : ['Team 1', 'Team 2']"
            :allowExtraPlayers="editEntry?.type === 'open'"
            :allowTeamName="editEntry?.type === 'open'"
            :allowDraw="editEntry?.type !== 'cup'"
            :avatarShape="editEntry?.type === 'open' ? 'circle' : 'square'"
            :incompleteLabel="editEntry?.type === 'open' ? 'Spieler wählen' : 'Teams wählen'"
            :save="saveEdit"
            :remove="deleteEdit"
        >
            <template v-if="editEntry && editEntry.type !== 'open'" #player="{ player, excludedNames, setName }">
                <LeagueTeamSelect :modelValue="player.name" :teams="editTeams" :excludedNames="excludedNames" @update:modelValue="setName"/>
            </template>
        </GameEntryDrawer>

        <TransferGameDrawer v-model:visible="transferVisible" :entry="transferEntry" @transferred="onTransferred"/>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';
import GameEntryDrawer from '@/components/shared/GameEntry/GameEntryDrawer.vue';
import TransferGameDrawer from '@/components/backend/manage/TransferGameDrawer.vue';
import LeagueTeamSelect from '@/components/frontend/league/LeagueTeamSelect.vue';
import { useGrayPage } from '@/components/shared/useGrayPage';
import { onGameSaved } from '@/components/shared/GameEntry/useAddGame';
import { applySidesToMatch, getSideName, matchToSides, type GameEntrySide } from '@/components/shared/GameEntry/gameEntry';
import { getAllOpenGames, updateOpenGame, deleteOpenGame } from '@/components/frontend/openGames/OpenGamesUtilFunctions';
import { getAllLeagueGames, getGameLeague, getGameSeason, updateLeagueGame, deleteLeagueGame } from '@/components/frontend/league/LeagueUtilFunctions';
import { getSeason, getSeasonTeams, toLeaguePlayers } from '@/components/frontend/league/LeagueSeasonsData';
import { getLeagueTeamLogo } from '@/components/frontend/league/LeaguePlayersData';
import { combineResults, matchesFilter, matchesPlayer, type GameFilter, type ResultEntry } from '@/components/frontend/results/resultsUtil';

const PAGE_SIZE = 20;

const FILTERS: { label: string; value: GameFilter }[] = [
    { label: 'Alle', value: 'all' },
    { label: 'Offen', value: 'open' },
    { label: 'Liga', value: 'league' },
    { label: 'Pokal', value: 'cup' },
];

const MORE_LINKS = [
    { to: '/Manage/LeagueCup', icon: '🏆', title: 'Pokal', subtitle: 'Auslosung, Freilose, Runden' },
    { to: '/Manage/Tournaments', icon: '🎪', title: 'Turniere', subtitle: 'Gruppen, K.-o.-Phase' },
    { to: '/Manage/Anmeldungen', icon: '📝', title: 'Anmeldungen', subtitle: 'BiPo Open 2026' },
];

useGrayPage();
const toast = useToast();

// ─── Spiele laden ───
const openGames = ref<Match[]>([]);
const leagueGames = ref<Match[]>([]);
const loading = ref(true);

const loadGames = async () => {
    const [openResult, leagueResult] = await Promise.allSettled([getAllOpenGames(), getAllLeagueGames()]);
    if (openResult.status === 'fulfilled') openGames.value = openResult.value;
    if (leagueResult.status === 'fulfilled') leagueGames.value = leagueResult.value;
    loading.value = false;
};
loadGames();
// Plus in der Navigation: neues Spiel sofort in der Liste
onGameSaved(loadGames);

// ─── Suche, Filter, Seiten ───
const query = ref('');
const activeFilter = ref<GameFilter>('all');
const visibleCount = ref(PAGE_SIZE);
const expandedId = ref<string>();

const filteredGames = computed(() => combineResults(openGames.value, leagueGames.value)
    .filter(entry => matchesFilter(entry, activeFilter.value) && matchesPlayer(entry.match, query.value)));

const visibleGames = computed(() => filteredGames.value.slice(0, visibleCount.value));

watch([activeFilter, query], () => {
    visibleCount.value = PAGE_SIZE;
    expandedId.value = undefined;
});

const toggleExpanded = (id: string) => {
    expandedId.value = expandedId.value === id ? undefined : id;
};

// ─── Bearbeiten ───
const editEntry = ref<ResultEntry>();
const editVisible = ref(false);

const editSeasonSlug = computed(() => editEntry.value ? getGameSeason(editEntry.value.match) : undefined);
const editSeason = computed(() => getSeason(editSeasonSlug.value));
const editDivision = computed(() => editEntry.value?.type === 'league'
    ? editSeason.value?.divisions.find(division => division.league === getGameLeague(editEntry.value!.match))
    : undefined);

// Liga: Teams der Liga des Spiels, Pokal: alle Teams der Saison
const editTeams = computed(() => toLeaguePlayers(editEntry.value?.type === 'cup'
    ? getSeasonTeams(editSeason.value)
    : editDivision.value?.teams ?? []));

const editSides = computed(() => {
    if (!editEntry.value) return undefined;
    const sides = matchToSides(editEntry.value.match);
    return editEntry.value.type === 'open'
        ? sides
        : sides.map(side => ({ ...side, logo: getLeagueTeamLogo(side.players[0]?.name ?? '', editSeasonSlug.value) }));
});

const editSubtitle = computed(() => {
    const entry = editEntry.value;
    if (!entry) return '';
    if (entry.type === 'open') return 'Offenes Spiel';
    const seasonLabel = editSeason.value ? `Saison ${editSeason.value.label}` : undefined;
    return entry.type === 'cup'
        ? ['League Cup', seasonLabel].filter(part => part).join(' · ')
        : ['BiPo League', editSeason.value?.label, editDivision.value?.label].filter(part => part).join(' · ');
});

const openEdit = (entry: ResultEntry) => {
    editEntry.value = entry;
    editVisible.value = true;
};

const updateGame = (entry: ResultEntry, match: Match) =>
    entry.type === 'open' ? updateOpenGame(match) : updateLeagueGame(match);

const deleteGame = (entry: ResultEntry) =>
    entry.type === 'open' ? deleteOpenGame(entry.match) : deleteLeagueGame(entry.match);

const saveEdit = async (sides: GameEntrySide[]) => {
    const success = await updateGame(editEntry.value!, applySidesToMatch(editEntry.value!.match, sides));
    await loadGames();
    return success;
};

const deleteEdit = async () => {
    const success = await deleteGame(editEntry.value!);
    expandedId.value = undefined;
    await loadGames();
    return success;
};

// ─── Übertragen in eine andere Spielart ───
const transferEntry = ref<ResultEntry>();
const transferVisible = ref(false);

const openTransfer = (entry: ResultEntry) => {
    transferEntry.value = entry;
    transferVisible.value = true;
};

const onTransferred = () => {
    expandedId.value = undefined;
    loadGames();
};

// ─── Löschen direkt aus der Liste ───
const removeGame = async (entry: ResultEntry) => {
    const [name1, name2] = matchToSides(entry.match).map(getSideName);
    if (!confirm(`Spiel ${name1} gegen ${name2} wirklich löschen?`)) return;
    try {
        if (!await deleteGame(entry)) throw new Error();
        toast.add({ severity: 'success', summary: 'Gelöscht', detail: `${name1} gegen ${name2}`, life: 3000 });
        expandedId.value = undefined;
        await loadGames();
    } catch {
        toast.add({ severity: 'error', summary: 'Fehler', detail: 'Spiel nicht gelöscht', life: 3000 });
    }
};
</script>

<style scoped>
/* Seite fuellt den Bildschirm: Liste nimmt den Rest, "Weitere Verwaltung" bleibt unten stehen.
   Hoehe = Bildschirm minus App-Header, Abstand oben und Innenabstand unten von .Page (App.vue) */
.Manage{
    --mn-page-offset: calc(var(--app-header-height) + 51px + 50px);
    display: flex;
    flex-direction: column;
    max-width: 640px;
    height: calc(100dvh - var(--mn-page-offset));
    min-height: 600px;
    margin: 0 auto;
    padding-top: 8px;
    color: var(--bp-text-strong);
}

.mn-head{
    margin-bottom: 14px;
}
.mn-title{
    margin: 0;
    color: var(--main-color);
    font-size: 32px;
    font-weight: 800;
    line-height: 1.15;
}
.mn-subtitle{
    margin: 2px 0 0;
    font-size: 13px;
    color: var(--bp-text-muted);
}

/* Suche */
.mn-search{
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    height: 44px;
    margin-bottom: 12px;
    padding: 0 6px 0 14px;
    border: 1px solid var(--bp-border-strong);
    border-radius: 12px;
    background: var(--bp-surface);
}
.mn-search:focus-within{
    border-color: var(--main-color);
}
.mn-search-icon{
    color: var(--bp-text-subtle);
    font-size: 14px;
}
.mn-search-input{
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    color: var(--bp-text-strong);
    /* 16px: iOS zoomt beim Fokus sonst in die Seite */
    font-size: 16px;
}
.mn-search-input::placeholder{
    color: var(--bp-text-subtle);
}
.mn-search-input::-webkit-search-cancel-button{
    display: none;
}
.mn-search-clear{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--bp-text-subtle);
    cursor: pointer;

    .pi{
        font-size: 12px;
    }
}
.mn-search-clear:hover{
    background: var(--bp-fill-soft);
}

:deep(.mn-filter){
    padding: 0;
}
:deep(.mn-filter .p-tablist-content){
    overflow: visible;
}
:deep(.mn-filter .p-tablist-tab-list){
    flex-wrap: wrap;
    gap: 6px;
}
:deep(.mn-filter .p-tablist-nav-button){
    display: none;
}

/* Spieleliste */
.mn-list{
    flex: 1;
    min-height: 220px;
    margin-top: 14px;
    overflow-y: auto;
    overscroll-behavior: contain;
    border-radius: 14px;
}
.mn-card{
    overflow: hidden;
    border: 1px solid var(--bp-border);
    border-radius: 14px;
    background: var(--bp-surface);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.mn-game.mn-game--open{
    border-color: var(--bp-border-strong);
    background: var(--bp-surface-soft);
}
.mn-menu{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 22px;
    margin-left: auto;
    border: none;
    border-radius: 999px;
    background: var(--bp-fill);
    color: var(--bp-text-strong);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    .pi{
        font-size: 12px;
    }
}
.mn-menu:hover,
.mn-game--open .mn-menu{
    background: var(--bp-fill-strong);
}

/* Aktionen unter dem aufgeklappten Spiel */
.mn-actions{
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    margin-top: 4px;
}
.mn-action{
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 34px;
    padding: 0 6px;
    border: 1px solid var(--bp-border-strong);
    border-radius: 10px;
    background: var(--bp-surface);
    color: var(--bp-text-strong);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    .pi{
        font-size: 12px;
    }
}
.mn-action:hover{
    background: var(--bp-fill-soft);
}
.mn-action--danger{
    border-color: transparent;
    background: var(--bp-danger-weak);
    color: var(--bp-danger-strong);
}
.mn-more{
    margin-top: 10px;
}
.mn-skeleton-row{
    height: 64px;
    margin-bottom: 6px;
    border-radius: 12px;
}
.mn-empty{
    padding: 40px 0;
    text-align: center;
    color: var(--bp-text-muted);
}

/* Weitere Verwaltung */
.mn-more-section{
    flex-shrink: 0;
    margin-top: 20px;
}
.mn-section-title{
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--bp-text-muted);
}
.mn-link{
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 14px;
    border-bottom: 1px solid var(--bp-border);
    color: var(--bp-text-strong);
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
}
.mn-link:last-child{
    border-bottom: none;
}
.mn-link:hover{
    background: var(--bp-fill-soft);
    color: var(--bp-text-strong);
}
.mn-link-icon{
    width: 24px;
    flex-shrink: 0;
    font-size: 18px;
    text-align: center;
}
.mn-link-text{
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
}
.mn-link-title{
    font-size: 15px;
    font-weight: 700;
}
.mn-link-subtitle{
    font-size: 12px;
    color: var(--bp-text-muted);
}
.mn-link-chevron{
    font-size: 11px;
    color: var(--bp-text-subtle);
}

/* MOBILE: .Page hat oben nur den Header, unten die Navigation */
@media (width <= 900px){
    .Manage{
        --mn-page-offset: calc(var(--app-header-height) + 1px + 30px + var(--app-bottom-nav-height) + env(safe-area-inset-bottom));
        min-height: 520px;
    }
    .mn-title{
        font-size: 28px;
    }
    :deep(.mn-filter .p-tab){
        padding-inline: 0.7rem;
    }
}
</style>
