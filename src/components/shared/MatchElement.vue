<script setup lang="ts">
import { ref } from "vue"

import ModalSetGameResult from '@/components/shared/ModalSetGameResult.vue';

defineProps(['match','stageIndex',"matchIndex","isBackend","tournament","getTournament","isGroupPhase"])
let showModal = ref(false);
const toggleModal = () => {
   showModal.value = !showModal.value;
}

const scaleFontSize = (elementID:any, name:string) => {
   if(window.innerWidth < 500){
      setTimeout(() => {
         var container:any = document.getElementById(elementID);
         if (container.innerText.length > 16) 
            container.style.fontSize = "13px";
         if (container.innerText.length > 20) 
            container.style.fontSize = "12px";
      }, 0);
   }

   return name;
}
</script>

<template>
    <div class="Match">

         <Transition name="fade">
            <ModalSetGameResult v-if="showModal" :tournament="tournament" :getTournament="getTournament" :toggleModal="toggleModal" :match="match" :isGroupPhase="isGroupPhase"/>
         </Transition>

         <div v-if="matchIndex != undefined" class="mt-index">
           <div>{{ matchIndex + 1 }}</div> 
         </div>

         <!-- Team 1 -->
         <div class="mt-team mt-team-first">
            <div v-if="stageIndex == 0 || !match.team1" class="mt-team-placeholder">{{ match.placeHolderTeam1 }}</div>
            <div v-if="match.team1" >
               <div class="mt-team-name" :id="match._id + match.team1.name">{{ scaleFontSize(match._id + match.team1.name, match.team1.name) }}</div>
               <div class="mt-team-players" v-for="player in match.team1.players" :key="player">{{ player }}</div>
            </div>
         </div>

         <!-- Result -->
         <div v-if="!match.result && !isBackend || !match.team1 || !match.team2" class="mt-vs">vs.</div>
         
         <div v-if="isBackend && !match.result && match.team1 && match.team2" class="bp-button mt-button" @click="toggleModal()">Eintragen</div>

         <div v-if="match.result" class="mt-result" @click="isBackend ? toggleModal() : ''" >
            <div class="mt-result-team">{{match.result.team1Score + " - " + match.result.team2Score}}</div>
            <div class="mt-result-player">{{match.result.team1Player1Score + " - " + match.result.team2Player1Score}}</div>
            <div class="mt-result-player">{{match.result.team1Player2Score + " - " + match.result.team2Player2Score}}</div>
         </div>

         <!-- Team 2 -->
         <div class="mt-team mt-team-second">
            <div v-if="stageIndex == 0 || !match.team2" class="mt-team-placeholder">{{ match.placeHolderTeam2 }}</div>
            <div v-if="match.team2">
               <div class="mt-team-name" :id="match._id + match.team2.name">{{ scaleFontSize(match._id + match.team2.name, match.team2.name) }}</div>
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
   height: 100%;
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
   align-self: stretch;
}
.mt-team-first{
   color: var(--main-color);
   text-align: right;
}
.mt-team-second{
   color: var(--secondary-color);
}
.mt-team, .mt-result, .mt-vs, .mt-button{
   padding: 10px;
}
.mt-team-name, .mt-result-team{
   font-size: 18px;
   font-weight: 500;
   font-style: normal;
   margin-bottom: 5px;
   line-height: 15px;
}  
.mt-team-players, .mt-result-player, .mt-team-placeholder{
   font-size: 14px;
   font-style: italic;
}
.mt-result, .mt-vs, .mt-button{
   text-align: center;
   width: 200px;
   align-self: stretch;
   display: flex;
   flex-direction: column;
   justify-content: center;
}
.mt-result{
   justify-content: flex-end;
}
.mt-button{
   font-size: 16px;
   margin: 0 20px;
   width: calc(200px - 40px);    /* width from .mt-result - margin */
}
.mt-vs{
   font-style: italic;
   color: gray;
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
      padding: 5px;
   }
   .mt-team-name, .mt-result-team{
      height: 24px;
      font-size: 16px;
   }
   .mt-team-players, .mt-result-player, .mt-team-placeholder{
      height: 25px;
      font-size: 14px;
   }
   .mt-team-placeholder{
      opacity: 0.7;
      margin-bottom: 4px;
   }
   .mt-result, .mt-vs{
      width: 125px;
      padding: 5px;
   }
}
</style>
