<template>
    <div class="League" :style="{ '--league-sticky-extra': stickyExtra }">

        <h1 class="bp-title !pb-[7px] !mb-[0px]">BiPo League</h1>

        <div v-if="seasonOptions.length > 1" class="lg-season-select">
            <Select
                :modelValue="season.slug"
                :options="seasonOptions"
                optionLabel="label"
                optionValue="value"
                @update:modelValue="changeSeason"
                :pt="{ root: { style: '--p-select-focus-border-color: var(--main-color);' } }"
            />
        </div>

        <div class="lg-logo">
            <Image :src="BipoLeagueLogo" preview
                :pt="{
                    toolbar: { style: 'display: none' },
                    previewMask: { style: 'background: transparent; opacity: 0' },
                    mask: { style: 'background-color: rgba(0, 0, 0, 0.9) !important' }
                }"
            />
        </div>

        <!-- Liga-Auswahl, nur wenn die Saison mehr als eine Liga hat -->
        <div v-if="season.divisions.length > 1" ref="divisionBar" class="lg-division-bar">
            <Tabs :value="activeLeague" @update:value="changeLeague">
                <TabList>
                    <Tab v-for="divisionOption in season.divisions" :key="divisionOption.league" :value="divisionOption.league" class="flex-1 justify-center">
                        {{ divisionOption.label }}
                    </Tab>
                </TabList>
            </Tabs>
        </div>

        <Loadingscreen v-if="isLoading"/>

        <div v-else-if="!division.teams.length" class="lg-empty">
            Für diese Liga sind noch keine Teams eingetragen.
        </div>

        <div v-else>
            <Tabs v-model:value="activeTab" class="pt-[20px] max-[900px]:pt-[10px]">
                <TabList class="w-full">
                    <Tab value="table" class="flex-1 justify-center">Tabelle</Tab>
                    <Tab value="games" class="flex-1 justify-center">Spiele</Tab>
                    <Tab v-if="division.hasFinalFour" value="finalfour" class="flex-1 justify-center">Final 4</Tab>
                </TabList>
                <TabPanels :pt="{ root: { style: { '--p-tabs-tabpanel-padding': '0.75rem 0' } } }">
                    <TabPanel value="table">
                        <LeagueTable
                            :leaguePlayers="leaguePlayers"
                            :leagueGames="divisionGames"
                            :regularSeasonGameCount="regularSeasonGameCount"
                            :highlightTopSlots="division.highlightTopSlots"
                            :promotionSlots="division.promotionSlots"
                            :relegationSlots="division.relegationSlots"
                        />
                    </TabPanel>

                    <TabPanel value="games">
                        <div class="bp-button" @click="toggleModalAddGame()">Spiel eintragen</div>

                        <Teleport to="body">
                            <Transition name="fade">
                                <ModalAddLeagueGame v-if="showModalAddGame"
                                    :toggleModalAddGame="toggleModalAddGame"
                                    :setMatch="setMatch"
                                    :leaguePlayers="leaguePlayers"
                                    :getLeagueGames="getLeagueGames"
                                    :seasonSlug="season.slug"
                                    :league="division.league"
                                />
                            </Transition>
                        </Teleport>

                        <div v-for="match in divisionGames" :key="match.time!" style="margin-top: 10px;">
                            <div style="color: var(--main-color)">{{ getGameTime(match.time!) }}</div>
                            <MatchElement :match="match" :avatarShape="'square'"/>
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

        </div>

    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Loadingscreen from '@/components/shared/Loadingscreen.vue';
import LeagueTable from './LeagueTable.vue';
import LeagueFinalFour from './LeagueFinalFour.vue';
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';
import ModalAddLeagueGame from './ModalAddLeagueGame.vue';
import { filterLeagueGames, getAllLeagueGames } from './LeagueUtilFunctions';
import {
    CURRENT_SEASON_SLUG,
    LEAGUE_SEASONS,
    getRegularSeasonGameCount,
    getSeason,
    toLeaguePlayers,
} from './LeagueSeasonsData';
import Image from "primevue/image";
import Select from 'primevue/select';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
// import BiPoKnecht from '@/components/frontend/biPoKnecht/BiPoKnecht.vue';
const BipoLeagueLogo = new URL(`/src/assets/league/BiPo-League-Logo.webp`, import.meta.url).href;

const route = useRoute();
const router = useRouter();

let showModalAddGame = ref(false);
let isLoading = ref(true);
let allLeagueGames = ref<Match[]>([]);
let match = ref<Match>();
let activeTab = ref('table');

// ─── Saison ───
const requestedSeasonSlug = route.params.Season as string | undefined;
const season = computed(() => getSeason(requestedSeasonSlug) ?? getSeason(CURRENT_SEASON_SLUG) ?? LEAGUE_SEASONS[0]);

// Unbekannter Saison-Slug -> auf die aktuelle Saison umleiten.
if (!getSeason(requestedSeasonSlug))
    router.replace(`/League/${CURRENT_SEASON_SLUG}`);

const seasonOptions = LEAGUE_SEASONS.map(entry => ({ label: `Saison ${entry.label}`, value: entry.slug }));

const changeSeason = (slug: string) => {
    if (slug !== season.value.slug)
        router.push(`/League/${slug}`);
}

// ─── Liga ───
const requestedLeague = Number(route.params.League);
const activeLeague = ref(
    season.value.divisions.some(entry => entry.league === requestedLeague)
        ? requestedLeague
        : season.value.divisions[0].league
);

const division = computed(() =>
    season.value.divisions.find(entry => entry.league === activeLeague.value) ?? season.value.divisions[0]
);

// Liga-Wechsel ohne Remount: App.vue keyed die router-view auf route.fullPath,
// ein router.push wuerde die Seite komplett neu aufbauen und neu laden.
const changeLeague = (value: string | number) => {
    activeLeague.value = Number(value);

    const newURL = `${window.location.origin}/League/${season.value.slug}/${activeLeague.value}`;
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

let setMatch = (newMatch: Match) => {
    match.value = newMatch;
    showModalAddGame.value = false;
}

const getLeagueGames = async () => {
    const games = await getAllLeagueGames();
    allLeagueGames.value = games.reverse();
    isLoading.value = false;
}
getLeagueGames();

const toggleModalAddGame = () => {
    showModalAddGame.value = !showModalAddGame.value;
}

let getGameTime = (dateNumber:number) => {
    let date = new Date(dateNumber);
    let time = date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    return date.toLocaleDateString("de-DE") + "  -  " + time + " Uhr";
}

// ─── Sticky-Offsets ───
// Die Liga-Leiste schiebt die darunter liegenden Sticky-Ebenen nach unten.
// Gemessen statt geraten, damit Tabellenkopf und Runden-Reiter nicht verspringen.
const divisionBar = ref<HTMLElement | null>(null);
const divisionBarHeight = ref(0);
const stickyExtra = computed(() => `${divisionBarHeight.value}px`);

let resizeObserver: ResizeObserver | undefined;

onMounted(() => {
    watch(divisionBar, (element) => {
        resizeObserver?.disconnect();
        if (!element) {
            divisionBarHeight.value = 0;
            return;
        }

        resizeObserver = new ResizeObserver(() => {
            divisionBarHeight.value = element.offsetHeight;
        });
        resizeObserver.observe(element);
        divisionBarHeight.value = element.offsetHeight;
    }, { immediate: true });
});

onBeforeUnmount(() => resizeObserver?.disconnect());
</script>

<style scoped>
.lg-logo{
    width: 100%;
    display: flex;
    justify-content: center;
}
.lg-logo span{
    width: 70px;
    height: auto;
    margin-bottom: 20px;
}
:deep(.lg-logo img){
    object-fit: contain !important;
}

.lg-season-select{
    display: flex;
    justify-content: center;
    margin-top: 10px;
    margin-bottom: 10px;
}

.lg-division-bar{
    position: sticky;
    top: 205px;
    z-index: 4;
    background: white;
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
    .lg-division-bar{
        top: 125px;
    }
}
</style>
