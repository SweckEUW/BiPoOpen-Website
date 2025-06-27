<script setup lang="ts">
import { PropType, ref } from "vue"
import ModalSetGameResult from '@/components/shared/MatchElement/ModalSetGameResult.vue';
import MatchElementTeam from '@/components/shared/MatchElement/MatchElementTeam.vue';
import { Match } from "@/types";
import { checkIfMatchFinished } from "@/tournamentFunctions/tournamentMatchFunctions";

const props = defineProps({
   match: {type: Object as PropType<Match>, required: true },
   setGameResult: {type: Function as PropType<(match:Match) => void> },
   isBackend: {type: Boolean, default: false},
});

let showModal = ref(false);
const toggleModal = () => {
   showModal.value = !showModal.value;
}

let playersVisible = ref(false);
let togglePlayersVisible = () => {
   if(props.match.team1.players.length != 1) // Only toggle players visibility if there are at least 2 players in the team
      playersVisible.value = !playersVisible.value;
}
</script>

<template>
    <div class="Match" ref="matchHTMLElement">

         <Teleport to="body">
            <Transition name="fade">
               <ModalSetGameResult v-if="showModal" :toggleModal="toggleModal" :match="match" :setGameResult="setGameResult"/>
            </Transition>
         </Teleport>

         <!-- <div v-if="isBackend" class="mt-handle">
            <div style="margin-bottom: 5px;"/>
            <div/>
         </div> -->

         <!-- Match Index -->
         <!-- <div v-if="matchIndex != undefined" class="mt-index">
           <div>{{ matchIndex + 1 + '.' }}</div> 
         </div> -->

         <!-- Team Name & Score -->
         <div class="mt-teams" @click="togglePlayersVisible()">
            <MatchElementTeam :match="match" :isTeam2="false" :playersVisible="playersVisible"/> <!-- Team 1 -->
            <MatchElementTeam :match="match" :isTeam2="true" :playersVisible="playersVisible"/> <!-- Team 2 -->
         </div>

         <!-- VS. -->
         <div v-if="!checkIfMatchFinished(match) && !isBackend || !match.team1 || !match.team2" class="mt-vs">vs.</div>

         <!-- Enter Result Button -->
         <div v-if="isBackend && match.team1 && match.team2" class="bp-button mt-button" @click="toggleModal()">{{ checkIfMatchFinished(match) ? 'Bearbeiten' : 'Eintragen'}}</div>

    </div>
</template>

<style scoped>
.Match{
   display: flex;
   align-items: center;
   width: 100%;
   padding: 10px;
   border: 1px solid black;
   margin-bottom: 10px;
   border-radius: 4px;
}

/* Handle for moving teams between groups */
.mt-handle{
   cursor: grab;
   margin-right: 20px;
}
.mt-handle div{
   height: 2px;
   width: 25px;
   background-color: black;
}

.mt-index{
   padding-right: 10px;
}

.mt-teams{
   flex-grow: 1;
}

/* Button for entering score */
.mt-button{
   font-size: 16px;
   margin: auto;
   margin-left: 10px;
}
.mt-vs{
   font-style: italic;
   color: gray;
}
.mt-vs, .mt-button{
   text-align: center;
   padding: 10px;
}


/*MOBILE*/
@media (width <= 900px){
   .mt-button{
      font-size: 14px;
   }
   .mt-vs, .mt-button{
      padding: 5px;
   }
}

/*MOBILE S*/
@media (width <= 360px){
   .mt-index{
      display: none;
   }
}
</style>