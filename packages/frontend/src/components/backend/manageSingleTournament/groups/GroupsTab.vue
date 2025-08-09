<script setup lang="ts">
import Sortable from "sortablejs";
import { ref, onMounted, PropType } from "vue"
import { convertNumberToCharacter } from "@/util/util"; 
import Modal from '@/components/shared/Modal.vue';
import GroupsSettings from '@/components/backend/manageSingleTournament/groups/GroupsSettings.vue';
import { getTeamFromName } from "@/util/tournamentTeamFunctions";
import { generateRandomGroups, generateRandomMatchesGroupPhase, setGroups } from "@/util/tournamentGroupFunctions";
import { initMatchesKOPhase } from "@/util/tournamentKOPhaseFunctions";

const props = defineProps({
   getTournament: {type: Function, required: true },
   tournament: {type: Object as PropType<Tournament>, required: true }
});

onMounted(() => {
   if(props.tournament.groupPhase.groups)
      initSortable();
});


const changeGroups = async () => {
   // 1. Construct Groups Array from DOM
   let groups:Group[] = [];

   let groupAmmount = props.tournament.settings.fixedGroupAmmount;
   for (let i = 0; i < groupAmmount; i++){ // Loop over all Groups
      let teams:{teamID: string}[] = [];
      let teamsDomElment = document.getElementById("Group-"+i)!.getElementsByTagName("tbody")[0].getElementsByTagName("tr"); // Get Dom Element of each Group containing Teamname
      for (let y = 0; y < teamsDomElment.length; y++) {
         let teamID = getTeamFromName(props.tournament, teamsDomElment[y].getElementsByTagName("td")[2].innerText)!._id;
         teams.push({teamID: teamID});
      }

      // @ts-ignore
      groups.push({teams: teams});
   }

   // 2. Set Groups in Database
   let success = await setGroups(props.tournament._id, groups);
   if(success)
      await initGroupAndKOMatches();
}

const generateRandomGroupsHere = async () => {
   await generateRandomGroups(props.tournament);
   await initGroupAndKOMatches();
}

const initGroupAndKOMatches = async () => {
   await props.getTournament();
   await generateRandomMatchesGroupPhase(props.tournament);
   await props.getTournament();
   await initMatchesKOPhase(props.tournament);
   await props.getTournament();
   initSortable();
   toggleModal();

   // DEBUG!
   // props.tournament.groupPhase.matches.forEach(async (groupMatches) => {
   //    await groupMatches.forEach(async (match) => {
   //       let team1Won = Math.random() > 0.5;
   //       let result = {
   //          team1Score: team1Won ? 10 : Math.floor(Math.random() * 9),
   //          team1Player1Score: Math.floor(Math.random() * 9), 
   //          team1Player2Score: Math.floor(Math.random() * 9), 
         
   //          team2Score: team1Won ? Math.floor(Math.random() * 9) : 10,
   //          team2Player1Score: Math.floor(Math.random() * 9), 
   //          team2Player2Score: Math.floor(Math.random() * 9)
   //       }
   //       await setGameResultGroupPhase(props.tournament, match._id, result);
   //    });
   // });
}

let generateRandom = ref(false);
let showModal = ref(false);
const toggleModal = (generate?:boolean) => {
   showModal.value = !showModal.value;
   if(generate != undefined)
      generateRandom.value = generate;
}

const initSortable = () => {
   setTimeout(() => {
      let groupAmmount = props.tournament.settings.fixedGroupAmmount;
      for (let i = 0; i < groupAmmount; i++){
         let groupDOM = document.getElementById("Group-"+i)!;
         let tbody = groupDOM.getElementsByTagName("tbody")[0];
         new Sortable(tbody, {
            animation: 150,
            group: 'shared',
            handle: ".lt-handle"
         });
      }
   }, 0);
}
</script>

<template>
   <div class="LayoutTab">

      <!-- Modal -->
      <Transition name="fade">
         <Modal v-if="showModal">
            <template #title>{{generateRandom ? "Gruppen auslosen" : "Gruppen umsortieren"}}</template>
            <template #template>
            <p style="text-align: center; white-space: break-spaces;">{{  generateRandom ? 
               "Sicher das die Gruppen ausgelost werden sollen?\nDadurch wird der Spielplan neu generiert und der alte gelöscht!" : 
               "Sicher das die Gruppen umsortiert werden sollen?\nDadurch wird der Spielplan neu generiert und der alte gelöscht!"
            }}</p>
            </template>
            <template #cancle>
               <div @click="toggleModal()">Abbrechen</div>
            </template>
            <template #confirm>
               <div @click="generateRandom ? generateRandomGroupsHere() : changeGroups()">{{ generateRandom ? "Auslosen" : "Umsortieren"}}</div>
            </template>
         </Modal>
      </Transition>

      <!-- GroupsSettings -->
      <GroupsSettings :tournament="tournament" :getTournament="getTournament"/>

      <!-- Buttons -->
      <div class="bp-button" style="margin-bottom: 20px;" @click="toggleModal(true)">Gruppen auslosen</div>
      <div class="bp-button"  @click="toggleModal(false)">Gruppen umsortieren</div>

      <!-- Groups -->
      <table class="table table-hover caption-top" v-for="(group,index) in tournament.groupPhase.groups" :key="index" :id="'Group-' + index">
         <caption>{{"Gruppe "+ convertNumberToCharacter(index + 1)}}</caption>
         <thead>
            <tr>
               <th></th>
               <th>#</th>
               <th>Teamname</th>
               <th>Spieler</th>
            </tr>
         </thead>
         <tbody>
            <tr v-for="(team,id) in group.teams" :key="team._id">
               <td class="lt-handle">
                  <div style="margin-bottom: 5px; margin-top: 5px;"/>
                  <div/>
               </td>
               <td>{{id+1}}</td>
               <td>{{team ? team.name : "Team nicht gefunden / wurde gelöscht"}}</td>
               <td v-if="team">
                  <span v-for="player in team.players" style="margin-right: 15px">{{player.name}}</span>
               </td>
            </tr>
         </tbody>
      </table>

   </div>
</template>

<style scoped>
.bp-button{
   margin-top: 20px;
}

.lt-handle{
   cursor: grab;
   width: 25px;
}
.lt-handle div{
   height: 2px;
   width: 25px;
   background-color: black;
}

table{
   margin-bottom: 30px;
   text-align: center;
}
caption{
   font-size: 28px;
   font-weight: bold;
   color: black;
}

table th{
   font-size: 20px;
   font-weight: bold;
}
table td:nth-child(2){
   max-width: 20px;
   width: 20px;
}
</style>
