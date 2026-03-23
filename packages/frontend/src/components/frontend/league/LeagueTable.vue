
<template>

    <Drawer v-model:visible="leaguePlayerOverviewVisible" position="bottom" class="!h-[80%] rounded-xs mobile-sheet" :blockScroll="true" :showCloseIcon="false" style="color: var(--main-color)">
        <template #header>
            <div class="w-full flex justify-content-center" v-if="selectedLeaguePlayer">
                <!-- <div class="drag-handle"></div> -->

                <div class="flex flex-column align-items-center">
                    <div class="font-bold text-[20px]">{{ selectedLeaguePlayer.name }}</div>
                    <Image class="h-[150px]" :src="selectedLeaguePlayer.logo" preview
                        :pt="{ 
                            toolbar: { style: 'display: none' },
                            previewMask: { style: 'background: transparent; opacity: 0' },
                            mask: { style: 'background-color: rgba(0, 0, 0, 0.9) !important' }
                        }"
                    />
                </div>
            </div>
        </template>

        <div v-if="selectedLeaguePlayer">
            <div v-for="round in orderedRounds" :key="round.name" class="mb-[40px]">
                <div class="font-bold text-[24px] capitalize">{{ round.name }}</div>

                <div class="mt-[10px] font-bold text-[20px]">
                    Absolvierte Spiele {{ round.data.matchesPlayed.length }}/{{ round.data.matchesPlayed.length + round.data.matchesToPlay.length }}
                </div>
                <div v-for="match in round.data.matchesPlayed" style="margin-top: 10px;">
                    <div class="lg-match-meta" v-if="match.time || getMatchResult(match)">
                        <Tag
                            v-if="getMatchResult(match)"
                            :severity="getMatchResult(match) === 'Sieg' ? 'success' : 'danger'"
                            :value="getMatchResult(match)"
                            rounded
                        />
                        <div v-if="match.time">{{ getGameTime(match.time) }}</div>
                    </div>
                    <MatchElement :match="match"/> 
                </div>

                <div v-if="round.data.matchesToPlay.length > 0" class="mt-[20px]">
                    <div class="font-bold text-[20px]">Offene Spiele</div>
                    <div v-for="match in round.data.matchesToPlay" style="margin-top: 10px;">
                        <MatchElement :match="match"/> 
                    </div>
                </div>
            </div>
        </div>
    </Drawer>

    <table class="table table-hover caption-top">
        <thead>
            <tr style="height: auto;">
                <th colspan="2" @click="setSortValue('placement')" :class="giveArrowClass('placement')" class="text-left!">Team</th>
                <th @click="setSortValue('ammountOfMatches')" :class="giveArrowClass('ammountOfMatches')">{{ windowWidth > 900 ? 'Spiele' : 'Spi.'}}</th>
                <th @click="setSortValue('wins')" :class="giveArrowClass('wins')">{{ windowWidth > 900 ? 'Siege' : 'S'}}</th>
                <th @click="setSortValue('looses')" :class="giveArrowClass('looses')">{{ windowWidth > 900 ? 'Niederlagen' : 'N'}}</th>
                <th>{{ windowWidth > 900 ? 'Trefferverhältnis' :'Trfv.'}}</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(player, index) in sortedLeaguePlayers" :key="index" @click="selectedLeaguePlayer = leaguePlayers.find(lp => lp.name === player.name); leaguePlayerOverviewVisible = true">
                <td>{{ player.placement! + 1}}</td>
                <td>
                    <div class="lg-team">
                        <img class="lg-logo" :src="props.leaguePlayers.find(lp => lp.name === player.name)?.logo">
                        <div>{{ player.name.replace(" ","\n") }}</div>
                    </div>
                </td>
                <td>{{ player.ammountOfMatches }}</td>
                <td>{{ player.wins }}</td>
                <td>{{ player.ammountOfMatches - player.wins }}</td>
                <td style="white-space: pre-line;">{{ `${player.hitDifference}\n(${player.hitDifferenceNumber > 0 ? '+' : ''}${player.hitDifferenceNumber})` }}</td>
            </tr>
        </tbody>
    </table>

    <div v-if="windowWidth < 900" class="lg-explain">
        <div>*Pl. = Platz</div>
        <div>*Spi. = Spiele</div>
        <div>*S = Siege</div>
        <div>*Trf. = Treffer</div>
        <div>*Trfq. = Trefferquote</div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { getLeagueList } from "./LeagueUtilFunctions";
import Image from "primevue/image";
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';
import Drawer from 'primevue/drawer';
import Tag from 'primevue/tag';
import { checkIfMatchFinished, checkIfTeam1WonVsTeam2 } from "@/util/tournamentMatchFunctions";

const props = defineProps({
    leaguePlayers: {type: Array as () => LeaguePlayer[], required: true },
    leagueGames: {type: Array as () => Match[], required: true }
});

let sortValue = ref<SortValueLeague>("wins");
let sortUp = ref(false);

let leaguePlayerOverviewVisible = ref(false);
let selectedLeaguePlayer = ref<LeaguePlayer | undefined>(undefined);

// Create ordered array for rendering
const orderedRounds = computed(() => {
    const games = gamesFromSelectedLeaguePlayer.value;
    if (!games) return [];

    const hinrunde = { name: 'hinrunde', data: games.hinrunde };
    const rückrunde = { name: 'rückrunde', data: games.rückrunde };

    // Swap order if Hinrunde is completed
    if (games.hinrunde.matchesToPlay.length === 0) return [rückrunde, hinrunde];

    return [hinrunde, rückrunde];
});

const gamesFromSelectedLeaguePlayer = computed(() => {
    const result = {
        hinrunde: {
            matchesPlayed: [] as Match[],
            matchesToPlay: [] as Match[]
        },
        rückrunde: {
            matchesPlayed: [] as Match[],
            matchesToPlay: [] as Match[]
        }
    };

    if (!selectedLeaguePlayer.value) return result;

    const selectedPlayerName = selectedLeaguePlayer.value.name;
    // Track match count per opponent
    const matchCounts: Record<string, number> = {};

    const allMatchesPlayed = props.leagueGames
        .filter((match) =>
            match.team1.players.some(p => p.name === selectedPlayerName) ||
            match.team2.players.some(p => p.name === selectedPlayerName)
        )
        // Ensure the first encounter per opponent is assigned to Hinrunde.
        .sort((a, b) => (a.time ?? 0) - (b.time ?? 0));

    // Distribute played matches
    allMatchesPlayed.forEach(match => {
        const isTeam1 = match.team1.players.some(p => p.name === selectedPlayerName);
        const opponentName = isTeam1 ? match.team2.players[0].name : match.team1.players[0].name;

        matchCounts[opponentName] = (matchCounts[opponentName] || 0) + 1;

        if (matchCounts[opponentName] === 1) result.hinrunde.matchesPlayed.push(match);
        if (matchCounts[opponentName] === 2) result.rückrunde.matchesPlayed.push(match);
    });

    // Calculate remaining matches
    props.leaguePlayers.forEach(player => {
        if (player.name === selectedPlayerName) return;

        const played = matchCounts[player.name] || 0;
        
        const newMatch = {
            team1: { _id: "", players: [{ name: selectedPlayerName }] },
            team2: { _id: "", players: [{ name: player.name }] }
        } as Match;

        if (played === 0) result.hinrunde.matchesToPlay.push(newMatch);
        if (played === 0) result.rückrunde.matchesToPlay.push({ ...newMatch });
        if (played === 1) result.rückrunde.matchesToPlay.push(newMatch);
    });
    
    return result;
});

const sortedLeaguePlayers = computed(() => {

    let leaguePlayersList = getLeagueList(props.leagueGames, props.leaguePlayers);

    // if(sortValue.value == "null")
    //     return leaguePlayersList;

    // // Sort the MVP List depenging on the sortValue
    // leaguePlayersList.sort((player1, player2) => {
    //     if(sortValue.value == "name") // sort strings
    //         return sortUp.value ? player1[sortValue.value].localeCompare(player2[sortValue.value]) : player2[sortValue.value].localeCompare(player1[sortValue.value])

    //     if(player2[sortValue.value] == player1[sortValue.value])
    //         return sortUp.value ? player2.placement! - player1.placement! : player1.placement! - player2.placement!;
        
    //     return sortUp.value ? player1[sortValue.value]! - player2[sortValue.value]! : player2[sortValue.value]! - player1[sortValue.value]!;
    // });

    return leaguePlayersList;
})

let windowWidth = ref(window.screen.width);
window.addEventListener("resize", () => {
    windowWidth.value = window.screen.width;
});

const setSortValue = (value:SortValueLeague) => {
    if(sortValue.value == value)
        sortUp.value = !sortUp.value;
    else
        sortUp.value = false;

    sortValue.value = value;
}

const giveArrowClass = (value:string) => {
    return "";
    if(value == sortValue.value)
        return sortUp.value ? "mvp-arrow mvp-arrow-up" : "mvp-arrow mvp-arrow-down";
}

let getGameTime = (dateNumber:number) => {
    let date = new Date(dateNumber);
    let time = date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    return date.toLocaleDateString("de-DE") + "  -  " + time + " Uhr";
}

let getMatchResult = (match: Match): 'Sieg' | 'Niederlage' | undefined => {
    if(!selectedLeaguePlayer.value || !checkIfMatchFinished(match))
        return undefined;

    const selectedPlayerName = selectedLeaguePlayer.value.name;
    const isTeam1 = match.team1.players.some(p => p.name === selectedPlayerName);
    const isTeam2 = match.team2.players.some(p => p.name === selectedPlayerName);
    const team1Won = checkIfTeam1WonVsTeam2(match);

    if(team1Won == undefined)
        return undefined;
    if(isTeam1)
        return team1Won ? 'Sieg' : 'Niederlage';
    if(isTeam2)
        return team1Won ? 'Niederlage' : 'Sieg';

    return undefined;
}
</script>

<style scoped>
table{
    text-align: center;
    padding-top: 20px;
}
table *{
    vertical-align: middle;
    border: none;
}
tbody tr{
    font-size: 18px;
}
tbody tr:nth-of-type(1){
    background: #8fe4f7;
    font-size: 22px;
}
tbody tr:nth-of-type(2){
    background: #aaeafa;
}
tbody tr:nth-of-type(3){
    background: #b5ecfa;
}
tbody tr:nth-of-type(4){
    background: #c6f2fd;
}
tbody tr:nth-last-of-type(3){
    background: #f3d4d7;
    font-size: 22px;
}
tbody tr:nth-last-of-type(2){
    background: #eeaab1;
}
tbody tr:nth-last-of-type(1){
    background: #e97f89;
}

table th{ 
    position: sticky;
    top: 260px;
    background-color: #FFF;
    color: var(--main-color);
    font-size: 20px;
    cursor: pointer;
    z-index: 2;
}
table td{
    background: inherit;
}

.lg-team{
    display: flex;
    align-items: center;
    justify-content: flex-start;
}
.lg-logo{
    width: 80px;
    height: 80px;
    object-fit: contain;
    margin-right: 20px;
}
.lg-team div{
    text-align: left;
}
.lg-match-meta{
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
}
.mvp-arrow-down::after, .mvp-arrow-up::after{
    content: ' ';
    position: relative;
    left: 10px;
    border: 8px solid transparent;
}
.mvp-arrow-down::after{
    top: 18px;
    border-top-color: var(--main-color);
}
.mvp-arrow-up::after{
    bottom: 18px;
    border-bottom-color: var(--main-color);
}

/* 1. Design für den "Griff" (Strich) */
.drag-handle {
  width: 40px;          /* Breite des Strichs */
  height: 5px;          /* Dicke des Strichs */
  background-color: var(--main-color); /* Hellgrau */
  border-radius: 10px;  /* Runde Enden */
  margin: 0 auto;       /* Zentrieren */
  cursor: grab;         /* Zeigt an, dass man ziehen kann */
}

/* 2. Styling der Sidebar selbst (nur für Mobile-Look) */
.mobile-sheet {
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
}

/* PrimeVue Header Padding anpassen, damit der Strich nicht zu viel Platz frisst */
.mobile-sheet .p-sidebar-header {
    padding: 10px 0 5px 0 !important;
    justify-content: center; /* Stellt sicher, dass der Slot zentriert ist */
}

/*MOBILE*/
@media (width <= 900px){
    .lg-explain{
        font-size: 14px;
        color: var(--main-color);
        margin-bottom: 30px;
    }
    table{
        width: 100%;
    }
    table *{
        font-size: 15px;
    }
    .table>:not(caption)>*>* {
        padding: 10px 4px;
    }
    tr{
        height: 80px;
    }
    table th{ 
        top: 190px;
        font-size: 15px;
    }
    th:nth-of-type(1), td:nth-of-type(1){
        max-width: 30px;
        width: 30px;
        padding-left: 4px;
        padding-right: 0px;
    }
    th:nth-of-type(2), td:nth-of-type(2){
        white-space: break-spaces;
    }
    .mvp-arrow-down::after, .mvp-arrow-up::after{
        left: 5px;
        border-width: 6px;
    }
    .mvp-arrow-down::after{
        top: 15px;
    }
    .mvp-arrow-up::after{
        bottom: 15px;
    }
    .lg-logo{
        margin-right: 10px;
        width: 80px;
        height: 80px;
    }
}

/*MOBILE S*/
@media (width <= 376px){
    table *{
        font-size: 14px !important;
    }
    .lg-team{
        font-size: 14px;
    }
    .lg-logo{
        width: 40px;
        height: 40px;
    }
}
</style>