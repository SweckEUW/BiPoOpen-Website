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

        <div v-if="!isLoading">

            <!-- Tabs -->
            <ul class="nav nav-tabs justify-content-center">
                <li class="nav-item">
                    <button class="nav-link active" data-bs-toggle="tab" :data-bs-target="'#LeagueTable'">Tabelle</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="tab" :data-bs-target="'#LeagueGames'">Spiele</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="tab" :data-bs-target="'#LeagueInfo'">Info</button>
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

                <div class="tab-pane fade" :id="'LeagueInfo'">
                    <h1 class="bp-title">Info zur BiPo League</h1>

                    <h2>Wettbewerbsmodus & Dauer</h2>
                    <ul>
                        <li><strong>System:</strong> 1 gegen 1 (Jeder gegen Jeden) mit Hin- und Rückspiel.</li>
                        <li><strong>Regeln:</strong> Offizielle BiPo-Open-Regeln, jedoch <u>ohne</u> „On-Fire“.</li>
                        <li><strong>Saison:</strong> Dauer: 6 Monate. Abschluss: Final-Four-Turnier.</li>
                        <li><strong>Final Four:</strong> Die Top 4 spielen um den Titel (1. gegen 4., 2. gegen 3.). Halbfinale und Finale im Best-of-3-Modus.</li>
                    </ul>

                    <h2>Termine & Ablauf</h2>
                    <ul>
                        <li><strong>Flexibilität:</strong> Matches können an festen Spieltagen oder flexibel (z. B. auf Partys) stattfinden.</li>
                        <li><strong>Schiedsrichter:</strong> Pflicht bei jedem Match. Der Schiedsrichter muss selbst Ligaspieler sein und das Protokoll führen.</li>
                        <li><strong>Quote:</strong> Ziel sind ca. 5 Spiele pro Monat, um auf ~30 Saisonspiele zu kommen.</li>
                    </ul>

                    <h2>Auf- und Abstieg</h2>
                    <p>
                        Um die Dynamik der Liga zu erhalten, steigen am Saisonende die letztplatzierten Spieler direkt in die untere Liga ab. 
                        Im Gegenzug steigen die bestplatzierten Spieler der unteren Liga direkt auf.
                        (Optional: Relegationsspiele sind möglich, falls zwei Spieler punktgleich sind.)
                    </p>
                </div>
            </div>

        </div>

    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
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