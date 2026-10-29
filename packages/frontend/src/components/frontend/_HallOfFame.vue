<script setup lang="ts">
import { ref, inject } from "vue"
import Column from 'primevue/column';
import Loadingscreen from '@/components/shared/Loadingscreen.vue';
import AppTable from '@/components/shared/AppTable.vue';
import { PODIUM_ROW_CLASSES, useTableLabels } from '@/components/shared/appTable';
import { getTournamentByName } from "@/util/tournamentFunctions";
import { getPlayersWithStats } from "@/util/tournamentPlayerFunctions";
import { BIPO_OPEN_TOURNAMENT_YEARS, BIPO_OPEN_WINNERS } from "@/util/bipoOpenTournamentMeta";

const openPlayerProfile = inject<(name: string) => void>('openPlayerProfile')!;

const labels = useTableLabels();

let tournaments:Tournament[] = [];
const hallOfFameList = ref<PlayerWithStats[]>([]);
let isLoading = ref(true);

// Initial load tournaments
let tournamentsToEvaluate = [...BIPO_OPEN_TOURNAMENT_YEARS];
const getTournament = async () => {
    for (let i = 0; i < tournamentsToEvaluate.length; i++) {
        let tournament = await getTournamentByName(tournamentsToEvaluate[i]);
        if(tournament)
            tournaments.push(tournament);
    }

    hallOfFameList.value = getSortedHallOfFameList();
    isLoading.value = false;
}
getTournament();

const getSortedHallOfFameList = () => {
    let players:PlayerWithStats[] = [];

    // Get players from all tournaments with stats. If the same player played in multiple tournaments, add the stats together
    tournaments.forEach((tournament) => {
        let playersWithStats = getPlayersWithStats(tournament);
        playersWithStats.forEach((player) => {
            let playerInList = players.find((playerTMP) => playerTMP.name == player.name);
            if(playerInList){
                playerInList.hits += player.hits;
                playerInList.ammountOfMatches += player.ammountOfMatches;
                playerInList.ammountOfMatchesWithTrackedShots += player.ammountOfMatchesWithTrackedShots;
                playerInList.ammountOfDrunkenCups += player.ammountOfDrunkenCups;
                playerInList.wins += player.wins;
            }else{
                players.push(player);
            }
        });
    });


    // Calculate correct average numbers
    players.forEach((player) => {
        // Calculate correct win
        let averageWins = player.wins / player.ammountOfMatches;
        player.averageWins = Math.round(averageWins * 100);

        // Calculate correct averageHits
        player.averageHits = player.hits / player.ammountOfMatchesWithTrackedShots;
        player.averageHits = Math.round(player.averageHits * 100) / 100; // Round average Hits
        if(!player.ammountOfMatchesWithTrackedShots)
            player.averageHits = 0;
    });

    // Sort players by wins and averageWins
    players.sort((player1, player2) => {
        if(player2.wins == player1.wins)
            return player2.averageWins - player1.averageWins;
        
        return player2.wins - player1.wins;
    });

    // Set placement
    for (let i = 0; i < players.length; i++) {
        players[i].placement = i;
        let playersWithSameScore = players.filter((player) => player.averageWins == players[i].averageWins && player.wins == players[i].wins)
        if(playersWithSameScore.length > 1){
            playersWithSameScore.forEach((playerWithSameScore) => {
                playerWithSameScore.placement = playersWithSameScore[0].placement;
            });
        }
    }

    return players;
};

// Platz 1-3 hervorheben, gleiche Platzierung = gleiche Farbe
const getRowClass = (row: PlayerWithStats) => PODIUM_ROW_CLASSES[row.placement!] ?? '';

let winners = BIPO_OPEN_WINNERS;
let trophyIcon = new URL(`/src/assets/icons/trophy.png`, import.meta.url).href;
</script>

<template>
    <div class="HallofFame">
        
        <h1 class="bp-title">Hall of Fame</h1>

        <Loadingscreen v-if="isLoading"/>

        <div v-show="!isLoading">

            <div class="hof-winners">
                <div class="hof-winner" v-for="winner in winners">
                    <div class="hof-winner-icon">
                        <img :src="trophyIcon" alt="">
                        <div>{{ winner.year }}</div>
                    </div>
                    <div class="hof-team">
                        <div class="hof-team-name">{{ winner.name }}</div>
                        <div>{{ winner.player1 }}</div>
                        <div>{{ winner.player2 }}</div>
                    </div>
                </div>
            </div>


            <div class="hof-text">Statistiken alle Spieler aus allen Turnieren sortiert nach der Anzahl der Siegen</div>

            <AppTable
                :value="hallOfFameList"
                :rowClass="getRowClass"
                @row-click="openPlayerProfile($event.data.name)"
                rank
                sortField="wins"
                :sortOrder="-1"
                class="hof-table mb-[30px]"
            >
                <Column field="name" header="Name" sortable :pt="{ columnTitle: { class: '!text-left' }, bodyCell: { class: '!text-left' } }">
                    <template #body="slotProps">
                        <span class="whitespace-pre-line">{{ slotProps.data.name.replace(" ", "\n") }}</span>
                    </template>
                </Column>
                <Column field="averageHits" sortable :header="labels.hitRate">
                    <template #body="slotProps">
                        {{ slotProps.data.hits ? slotProps.data.averageHits : "/" }}
                    </template>
                </Column>
                <Column field="wins" sortable :header="labels.wins"/>
                <Column field="ammountOfMatches" sortable :header="labels.games"/>
                <Column field="averageWins" sortable :header="labels.winRate">
                    <template #body="slotProps">
                        {{ slotProps.data.averageWins + "%" }}
                    </template>
                </Column>
            </AppTable>

        </div>

    </div>
</template>

<style scoped>
/* HoF Winners */
.hof-winners{
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}
.hof-winner{
    position: relative;
    display: flex;
    align-items: center;
    margin: 0px 40px 30px 40px;
    width: 20%;
}
.hof-winner::after {
  content: '';
  position: absolute;
  bottom: -20px;
  width: 100%;
  border-bottom: 1px solid var(--main-color);
  opacity: 0.5;
}
.hof-winner:nth-child(even){
    flex-direction: row-reverse;
}
.hof-winner-icon{
    position: relative;
    margin-right: 20px;
}
.hof-winner-icon img{
    width: 110px;
}
.hof-winner-icon div{
    position: absolute;
    bottom: 9px;
    left: 20px;
    width: 70px;
    height: 30px;
    font-weight: bold;
    color: white;
    font-size: 11px;
    line-height: 11px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
}
.hof-team{
    flex: 1;
    text-align: center;
}
.hof-team-name{
    font-weight: bold;
    font-size: 18px;
}


.hof-text{
    text-align: center;
    margin-top: 50px;
    margin-bottom: 50px;
    font-size: 18px;
    color: var(--main-color);
}

/*MOBILE*/
@media (width <= 900px){
    .hof-winner{
        width: 85%;
    }
    .hof-text{
        font-size: 16px;
        margin-bottom: 30px;
    }
}

</style>
