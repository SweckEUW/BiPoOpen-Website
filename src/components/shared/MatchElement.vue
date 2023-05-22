<script setup lang="ts">
import { ref } from "vue"

import ModalSetGameResult from '@/components/shared/ModalSetGameResult.vue';

defineProps(['match','stageIndex',"matchIndex","isBackend","tournament","getTournament","isGroupPhase"])
let showModal = ref(false);
const toggleModal = () => {
   showModal.value = !showModal.value;
}
</script>

<template>
    <div class="Match">

         <Transition name="fade">
            <ModalSetGameResult v-if="showModal" :tournament="tournament" :getTournament="getTournament" :toggleModal="toggleModal" :match="match" :isGroupPhase="isGroupPhase"/>
         </Transition>

         <div v-if="matchIndex != undefined" class="mt-index" :style="{'background' : match.result ? match.result.team1Score > match.result.team2Score ? 'var(--result-green)' : 'var(--result-red)' : ''}">
           <div>{{ matchIndex + 1 }}</div> 
         </div>

         <!-- Team 1 -->
         <div class="mt-team" style="text-align: right" :style="{'background' : match.result ? match.result.team1Score > match.result.team2Score ? 'var(--result-green)' : 'var(--result-red)' : ''}">
            <div v-if="stageIndex == 0 || !match.team1" class="mt-team-placeholder">{{ match.placeHolderTeam1 }}</div>
            <div v-if="match.team1" >
               <div class="mt-team-name">{{match.team1.name}}</div>
               <div class="mt-team-players" v-for="player in match.team1.players" :key="player">{{ player }}</div>
            </div>
         </div>

         <!-- Result -->
         <div v-if="!match.result && !isBackend || !match.team1 || !match.team2" class="mt-result">vs.</div>
         
         <div v-if="isBackend && !match.result && match.team1 && match.team2" class="bp-button mt-button mt-result" @click="toggleModal()">Eintragen</div>

         <div v-if="match.result" class="mt-result" @click="isBackend ? toggleModal() : ''" :style="{
            'background' : match.result ? match.result.team1Score > match.result.team2Score ? 'linear-gradient(90deg, var(--result-green), var(--result-red))' : 'linear-gradient(90deg, var(--result-red), var(--result-green))' : '',
            'paddingTop' : stageIndex == 0 ? '31px' : ''
         }">
            <div class="mt-result-team">{{match.result.team1Score + " - " + match.result.team2Score}}</div>
            <div class="mt-result-player">{{match.result.team1Player1Score + " - " + match.result.team2Player1Score}}</div>
            <div class="mt-result-player">{{match.result.team1Player2Score + " - " + match.result.team2Player2Score}}</div>
         </div>

         <!-- Team 2 -->
         <div class="mt-team" :style="{'background' : match.result ? match.result.team2Score > match.result.team1Score ? 'var(--result-green)' : 'var(--result-red)' : ''}">
            <div v-if="stageIndex == 0 || !match.team2" class="mt-team-placeholder">{{ match.placeHolderTeam2 }}</div>
            <div v-if="match.team2">
               <div class="mt-team-name">{{match.team2.name}}</div>
               <div class="mt-team-players" v-for="player in match.team2.players" :key="player">{{ player }}</div>
            </div>
         </div>

    </div>
</template>

<style scoped>

.Match{
   display: flex;
   justify-content: center;
   align-items: center;
   white-space: nowrap;
   width: 100%;
}
.mt-index{
   width: 40px;
   min-width: 40px;
   text-align: center;
   align-self: stretch;
   display: flex;
   justify-content: center;
   align-items: center;
}
.mt-team{
   width: 100%;
   display: flex;
   flex-direction: column;
   justify-content: center;
}
.mt-team, .mt-result{
   padding: 10px;
}
.mt-team-name, .mt-result-team{
   font-size: 18px;
   font-weight: bold;
   color: rgb(56, 56, 56);
   font-style: normal;
   margin-bottom: 5px;
}  
.mt-team-players, .mt-result-player, .mt-team-placeholder{
   font-size: 14px;
   font-style: italic;
   color: rgb(87, 87, 87);
}
.mt-result{
   text-align: center;
   width: 200px;
}
.mt-button{
   font-size: 16px;
   margin: 0 20px;
   width: calc(200px - 40px);    /* width from .mt-result - margin */
}

/*MOBILE*/
@media (width <= 900px){
   .Match{
      white-space: normal;
   }
   .mt-index{
      display: none;
   }
   .mt-team{
      padding: 10px 5px;
   }
   .mt-team-name, .mt-result-team{
      height: 50px;
      font-size: 16px;
   }
   .mt-team-players, .mt-result-player, .mt-team-placeholder{
      height: 25px;
      font-size: 14px;
   }
   .mt-result{
      width: 140px;
   }
}
</style>
