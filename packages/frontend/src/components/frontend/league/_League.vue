<template>
    <div class="League">
        
        <h1 class="bp-title">BiPo League</h1>
        <div class="lg-logo">
            <Image :src="BipoLeagueLogo" preview 
                :pt="{ 
                    toolbar: { style: 'display: none' },
                    previewMask: { style: 'background: transparent; opacity: 0' },
                    mask: { style: 'background-color: rgba(0, 0, 0, 0.9) !important' }
                }"
            />
        </div>

        <Loadingscreen v-if="isLoading"/>

        <div v-show="!isLoading">

            <!-- Tabs -->
            <ul class="nav nav-tabs justify-content-center">
                <li class="nav-item">
                    <button class="nav-link active" data-bs-toggle="tab" :data-bs-target="'#LeagueTable'">Tabelle</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="tab" :data-bs-target="'#LeagueGames'">Spiele</button>
                </li>
            </ul>

            <!-- Content -->
            <div class="tab-content" id="OpenGamesStatisticsContainer">
                <div class="tab-pane fade show active" :id="'LeagueTable'">
                   <LeagueTable :leaguePlayers="leaguePlayers" :leagueGames="leagueGames" />
                </div>

                <div class="tab-pane fade" :id="'LeagueGames'">
                    <!-- Add Game Button -->
                    <div class="bp-button" @click="toggleModalAddGame()">Spiel eintragen</div>

                    <Teleport to="body">
                        <Transition name="fade">
                            <ModalAddLeagueGame v-if="showModalAddGame" :toggleModalAddGame="toggleModalAddGame" :setMatch="setMatch" :leaguePlayers="leaguePlayers" :getLeagueGames="getLeagueGames"/>
                        </Transition>
                    </Teleport>

                    <!-- <BiPoKnecht v-if="match" :match="match" :isLeagueGame="true"/> -->

                    <div v-for="match in leagueGames" :key="match.time!" style="margin-top: 10px;">
                        <div style="color: var(--main-color)">{{ getGameTime(match.time!) }}</div>
                        <MatchElement :match="match"/> 
                    </div>
                </div>
            </div>

        </div>

    </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue';
import Loadingscreen from '@/components/shared/Loadingscreen.vue';
import LeagueTable from './LeagueTable.vue';
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';
import ModalAddLeagueGame from './ModalAddLeagueGame.vue';
import { getAllLeagueGames } from './LeagueUtilFunctions';
import Image from "primevue/image";
// import BiPoKnecht from '@/components/frontend/biPoKnecht/BiPoKnecht.vue';
const BipoLeagueLogo = new URL(`/src/assets/league/BiPo-League-Logo.webp`, import.meta.url).href;

let showModalAddGame = ref(false);
let isLoading = ref(true);
let leagueGames = ref<Match[]>([]);
let match = ref<Match>();

let leaguePlayers:LeaguePlayer[] = [
    { name: "Hangover Heroes", logo: new URL(`/src/assets/league/teams/Hangover-Heroes.webp`, import.meta.url).href },
    { name: "Hopfenstreife", logo: new URL(`/src/assets/league/teams/Hopfenstreife.webp`, import.meta.url).href },
    { name: "Cupfire Squad", logo: new URL(`/src/assets/league/teams/Cupfire-Squad.webp`, import.meta.url).href },
    { name: "Lokomotive Wiedenbrück", logo: new URL(`/src/assets/league/teams/Lokomotive-Wiedenbrueck.webp`, import.meta.url).href },
    { name: "Don Promillo", logo: new URL(`/src/assets/league/teams/Don-Promillo.webp`, import.meta.url).href },
    { name: "Wonne", logo: new URL(`/src/assets/league/teams/Wonne.webp`, import.meta.url).href },
    { name: "El Gunto", logo: new URL(`/src/assets/league/teams/El-Gunto.webp`, import.meta.url).href },
    { name: "BPC Likör", logo: new URL(`/src/assets/league/teams/BPC-Likoer.webp`, import.meta.url).href },
    { name: "Schlauti Saufmann", logo: new URL(`/src/assets/league/teams/Schlauti-Saufmann.webp`, import.meta.url).href },
    { name: "FC Pongus Longus", logo: new URL(`/src/assets/league/teams/FC-Pongus-Longus.webp`, import.meta.url).href },
    { name: "BPC Knick", logo:  new URL(`/src/assets/league/teams/BPC-Knick.webp`, import.meta.url).href },
    { name: "Ostgold", logo:  new URL(`/src/assets/league/teams/Ostgold.webp`, import.meta.url).href },
    { name: "Schaufautomat", logo: new URL(`/src/assets/league/teams/BPC-Schauf.webp`, import.meta.url).href },
    { name: "Anime Dude", logo: new URL(`/src/assets/league/teams/Anime-Dude.webp`, import.meta.url).href },
    { name: "SallyWin All-in", logo: new URL(`/src/assets/league/teams/SallyWin-All-in.webp`, import.meta.url).href }
]

let setMatch = (newMatch: Match) => {
    match.value = newMatch;
    showModalAddGame.value = false;
}

const getLeagueGames = async () => {
    leagueGames.value = await getAllLeagueGames();
    leagueGames.value = leagueGames.value.reverse();
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
</script>

<style scoped>
.lg-logo{
    width: 100%;
    display: flex;
    justify-content: center;
}
.lg-logo span{
    width: 100px;
    height: auto;
    margin-bottom: 20px;
}
:deep(.lg-logo img){
    object-fit: contain !important;
}

.nav{
   border: none;
   padding-bottom: 30px;
}
.nav-tabs{
    position: sticky;
    top: 160px;
    padding-top: 20px;
    background: white;
    z-index: 2;
}
.nav-link{
    border-radius: 0px;
    width: 40vw;
    padding: 15px 10px;
    color: var(--secondary-color);
    font-weight: bold;
}
.nav-item{
    flex: 1;
}
.nav-item .active{
    background-color: var(--main-color) !important;
    color: white !important;
}
.nav-item button{
    width: 100%;
}

/* MOBILE */
@media (width <= 900px){
   .nav-tabs{
        top: 130px;
        padding-top: 10px;
    }   
   .nav-link{
        font-size: 14px;
        padding: 10px 10px;
    }
}
</style>