<template>
    <div class="League">

        <!-- Kopf: Titel links, Saison-Auswahl rechts -->
        <div class="lg-head">
            <h1 class="bp-title">BiPo League</h1>
            <Select v-if="seasonOptions.length > 1"
                class="lg-season-select"
                size="small"
                aria-label="Saison"
                :modelValue="season.slug"
                :options="seasonOptions"
                optionLabel="label"
                optionValue="value"
                @update:modelValue="changeSeason"
            />
        </div>

        <!-- lazy: nur der aktive Reiter wird gerendert -->
        <Tabs v-model:value="activeTab" lazy>
            <!-- Liga/Cup-Auswahl + Reiter kleben gemeinsam unter dem App-Header -->
            <div ref="stickyBar" class="lg-sticky-bar" :style="{ top: stickyBarTop }">
                <!-- Liga-Auswahl, nur wenn die Saison mehr als eine Liga oder einen Pokal hat -->
                <SelectButton v-if="leagueOptions.length > 1"
                    class="lg-division-select"
                    fluid
                    :allowEmpty="false"
                    :modelValue="activeLeague"
                    :options="leagueOptions"
                    optionLabel="label"
                    optionValue="value"
                    @update:modelValue="changeLeague"
                />

                <TabList v-if="showDivisionTabs">
                    <Tab value="table">Tabelle</Tab>
                    <Tab value="games">Spiele</Tab>
                    <!-- <Tab v-if="division.hasFinalFour" value="finalfour">Final 4</Tab> -->
                </TabList>
            </div>

            <Loadingscreen v-if="isLoading"/>

            <LeagueCup v-else-if="isCupActive"
                :season="season"
                :allLeagueGames="allLeagueGames"            />

            <div v-else-if="!division.teams.length" class="lg-empty">
                Für diese Liga sind noch keine Teams eingetragen.
            </div>

            <TabPanels v-else :pt="{ root: { style: { '--p-tabs-tabpanel-padding': '0' } } }">
                <TabPanel value="table" class="lg-gray-panel">
                    <LeagueTable
                        :leaguePlayers="leaguePlayers"
                        :leagueGames="divisionGames"
                        :regularSeasonGameCount="regularSeasonGameCount"
                        :highlightTopSlots="division.highlightTopSlots"
                        :promotionSlots="division.promotionSlots"
                        :relegationSlots="division.relegationSlots"
                    />
                </TabPanel>

                <TabPanel value="games" class="pt-[12px]">
                    <div v-for="match in divisionGames" :key="match.time!" style="margin-top: 10px;">
                        <MatchElement :match="withLeagueTeamLogos(match)" :avatarShape="'square'" showDate/>
                    </div>
                </TabPanel>

                <TabPanel v-if="division.hasFinalFour" value="finalfour">
                    <LeagueFinalFour
                        :leaguePlayers="leaguePlayers"
                        :leagueGames="divisionGames"
                        :regularSeasonGameCount="regularSeasonGameCount"
                        :teams="division.teams"
                    />
                </TabPanel>
            </TabPanels>
        </Tabs>

        <!-- Spiel auslosen: weisser Rad-Button (eingetragen wird ueber das Plus in der Navigation) -->
        <FloatingActionButton
            label="Spiele auslosen"
            :image="wheelIcon"
            light
            :visible="!isLoading && showDivisionTabs"
            @click="toggleModalDraw()"
        />

        <LeagueDrawDrawer
            v-model:visible="showModalDraw"
            :leaguePlayers="leaguePlayers"
            :leagueGames="divisionGames"
            :regularSeasonGameCount="regularSeasonGameCount"
        />

    </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Loadingscreen from '@/components/shared/Loadingscreen.vue';
import FloatingActionButton from '@/components/shared/FloatingActionButton.vue';
import wheelIcon from '@/assets/icons/wheel.png';
import LeagueTable from './LeagueTable.vue';
import LeagueFinalFour from './LeagueFinalFour.vue';
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';
import { onGameSaved, useAddGameContext } from '@/components/shared/GameEntry/useAddGame';
import LeagueDrawDrawer from './LeagueDrawDrawer.vue';
import LeagueCup from './cup/LeagueCup.vue';
import { filterLeagueGames, getAllLeagueGames } from './LeagueUtilFunctions';
import { CUP_URL_SEGMENT } from './cup/LeagueCupUtilFunctions';
import { withLeagueTeamLogos } from './LeaguePlayersData';
import {
    CURRENT_SEASON_SLUG,
    LEAGUE_SEASONS,
    getRegularSeasonGameCount,
    getSeason,
    toLeaguePlayers,
} from './LeagueSeasonsData';
import { useStickyBar } from '@/components/shared/useStickyStack';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
// import BiPoKnecht from '@/components/frontend/biPoKnecht/BiPoKnecht.vue';

const route = useRoute();
const router = useRouter();

let showModalDraw = ref(false);
let isLoading = ref(true);
// shallowRef: Spiele werden nur komplett ersetzt, nie veraendert
let allLeagueGames = shallowRef<Match[]>([]);
let activeTab = ref('table');

// ─── Saison ───
const requestedSeasonSlug = route.params.Season as string | undefined;
const season = computed(() => getSeason(requestedSeasonSlug) ?? getSeason(CURRENT_SEASON_SLUG) ?? LEAGUE_SEASONS[0]);

// Unbekannter Saison-Slug -> auf die aktuelle Saison umleiten.
if (!getSeason(requestedSeasonSlug))
    router.replace(`/League/${CURRENT_SEASON_SLUG}`);

const seasonOptions = LEAGUE_SEASONS.map(entry => ({ label: entry.label, value: entry.slug }));

const changeSeason = (slug: string) => {
    if (slug !== season.value.slug)
        router.push(`/League/${slug}`);
}

// ─── Liga ───
// 'cup' = Reiter League Cup (URL-Segment "Pokal") statt einer Liga.
const requestedLeague = route.params.League as string | undefined;
const activeLeague = ref<number | 'cup'>(
    requestedLeague === CUP_URL_SEGMENT && season.value.hasCup
        ? 'cup'
        : season.value.divisions.some(entry => entry.league === Number(requestedLeague))
            ? Number(requestedLeague)
            : season.value.divisions[0].league
);

const isCupActive = computed(() => activeLeague.value === 'cup');

const leagueOptions = computed(() => [
    ...season.value.divisions.map(entry => ({ label: entry.label, value: entry.league as number | 'cup' })),
    ...(season.value.hasCup ? [{ label: 'League Cup', value: 'cup' as const }] : []),
]);

const division = computed(() =>
    season.value.divisions.find(entry => entry.league === activeLeague.value) ?? season.value.divisions[0]
);

// Liga-Wechsel ohne Remount: App.vue keyed die router-view auf route.fullPath,
// ein router.push wuerde die Seite komplett neu aufbauen und neu laden.
const changeLeague = (value: number | 'cup' | null) => {
    if (value === null || value === activeLeague.value)
        return;

    activeLeague.value = value;

    const urlSegment = activeLeague.value === 'cup' ? CUP_URL_SEGMENT : activeLeague.value;
    const newURL = `${window.location.origin}/League/${season.value.slug}/${urlSegment}`;
    window.history.replaceState({ ...window.history.state, as: newURL, url: newURL }, '', newURL);
    window.scrollTo({ top: 0, behavior: 'instant' });
}

// Final-4-Reiter gibt es nicht in jeder Liga.
watch(division, (newDivision) => {
    if (activeTab.value === 'finalfour' && !newDivision.hasFinalFour)
        activeTab.value = 'table';
});

// ─── Daten ───
const leaguePlayers = computed(() => toLeaguePlayers(division.value.teams));
const regularSeasonGameCount = computed(() => getRegularSeasonGameCount(division.value));
const divisionGames = computed(() => filterLeagueGames(allLeagueGames.value, season.value.slug, division.value.league));

const getLeagueGames = async () => {
    const games = await getAllLeagueGames();
    allLeagueGames.value = games.reverse();
    isLoading.value = false;
}
getLeagueGames();

// Plus in der Navigation: Liga bzw. Pokal vorausgewaehlt, nach dem Eintragen neu laden
useAddGameContext(() => isCupActive.value ? { mode: 'cup' } : { mode: 'league', league: division.value.league });
onGameSaved(getLeagueGames);

const toggleModalDraw = () => {
    showModalDraw.value = !showModalDraw.value;
}


// ─── Sticky-Leiste ───
// Liga-Auswahl und Reiter kleben unter dem App-Header, die darunter liegenden
// Sticky-Ebenen (Tabellen-Reiter, Tabellenkopf, Cup-Runden) kleben unter ihnen.
const stickyBar = ref<HTMLElement | null>(null);
const stickyBarTop = useStickyBar(stickyBar);

const showDivisionTabs = computed(() => !isCupActive.value && division.value.teams.length > 0);
</script>

<style scoped>
.lg-head{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0 16px;
}

/* Abstaende kommen vom Kopf, damit Titel und Saison-Auswahl mittig zueinander stehen */
.lg-head .bp-title{
    padding: 0;
    min-width: 0;
}

.lg-season-select{
    flex-shrink: 0;
    border-radius: 999px;
    padding-left: 6px;
    --p-select-focus-border-color: var(--main-color);
    /* schmaler Pfeil-Bereich, damit der Pfeil naeher am Text sitzt */
    --p-select-dropdown-width: 1.75rem;
}
:deep(.lg-season-select .p-select-label){
    font-weight: 700;
    color: #1f2328;
    padding-right: 0;
}

.lg-sticky-bar{
    position: sticky;
    z-index: 4;
    background: white;
    /* Weiss bis an den Bildschirmrand, damit der graue Grund seitlich nicht durchscheint */
    box-shadow: 0 0 0 100vmax white;
    clip-path: inset(0 -100vmax);
}

.lg-division-select{
    margin-bottom: 4px;
}

/* Grauer Grund unter der Tabelle, randlos bis an den Bildschirmrand */
.League :deep(.lg-gray-panel){
    background: var(--page-gray);
    margin-inline: calc(50% - 50vw);
    padding: 0 calc(50vw - 50%) 8px;
}

.lg-empty{
    text-align: center;
    color: var(--main-color);
    opacity: 0.8;
    padding: 40px 20px;
}

h2{
    font-size: 24px;
    width: 100%;
    text-align: center;
    color: var(--secondary-color);
    margin-top: 20px;
}
ul{
    padding: 0;
}

/* Make Avatars Bigger */
:deep(.p-avatar){
    width: 50px;
    height: 50px;
}

/* MOBILE */
@media (max-width: 900px){
    .lg-head{
        padding: 12px 0 14px;
    }
}

</style>
