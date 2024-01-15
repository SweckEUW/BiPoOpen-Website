<script setup lang="ts">
import Sortable from "sortablejs";
import { ref, onMounted } from "vue"
import { setGroups, generateRandomGroups, getTeamFromName, generateRandomMatchesGroupPhase, initMatchesKOPhase, getGroups } from "@/util/tournamentUtilFunctions.js";
import { convertNumberToCharacter } from "@/util/util.js"; 

import Modal from '@/components/shared/Modal.vue';
import GroupsSettings from '@/components/backend/manageSingleTournament/groups/GroupsSettings.vue';

const props = defineProps(['getTournament','tournament'])

const changeGroups = async () => {
   // 1. Construct Groups Array from DOM
   let groups:any = [];

   let groupAmmount:number = props.tournament.settings.fixedGroupAmmount;
   for (let i = 0; i < groupAmmount; i++){ // Loop over all Groups
      let teams:any = [];
      let teamsDomElment:any = document.getElementById("Group-"+i)?.getElementsByTagName("tbody")[0].getElementsByTagName("tr"); // Get Dom Element of each Group containing Teamname
      for (let y = 0; y < teamsDomElment.length; y++) {
         teams.push({
            teamID: getTeamFromName(props.tournament, teamsDomElment[y].getElementsByTagName("td")[2].innerText)._id
         });
      }

      groups.push({teams: teams});
   }

   // 2. Set Groups in Database
   let success:boolean = await setGroups(props.tournament._id, groups);
   if(success){
      await props.getTournament();
      await generateRandomMatchesGroupPhase(props.tournament);
      await props.getTournament();
      await initMatchesKOPhase(props.tournament);
      await props.getTournament();
      initSortable();
      toggleModal();
   }
}

const initSortable = () => {
   setTimeout(() => {
      let groupAmmount:number = props.tournament.settings.fixedGroupAmmount;
      for (let i = 0; i < groupAmmount; i++){
         let groupDOM:any = document.getElementById("Group-"+i);
         let tbody:any = groupDOM.getElementsByTagName("tbody")[0];
         new Sortable(tbody, {
            animation: 150,
            group: 'shared',
            handle: ".lt-handle"
         });
      }
   }, 0);
}

onMounted(() => {
   if(props.tournament.groupPhase.groups)
      initSortable();
});

const generateGroups = async () => {
   await generateRandomGroups(props.tournament);
   await props.getTournament();
   await generateRandomMatchesGroupPhase(props.tournament);
   await props.getTournament();
   await initMatchesKOPhase(props.tournament);
   await props.getTournament();

   // DEBUG!
   // props.tournament.groupPhase.matches.forEach((groupMatches:any) => {
   //    groupMatches.forEach((match:any) => {
   //       setGameResultGroupPhase(props.tournament, match._id, 5, 5, 2, 2);
   //    });
   // });

   toggleModal();
}

let generateRandom = ref(false);
let showModal = ref(false);
const toggleModal = (generate?:boolean) => {
   showModal.value = !showModal.value;
   if(generate != undefined)
      generateRandom.value = generate;
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
               <div @click="generateRandom ? generateGroups() : changeGroups()">{{ generateRandom ? "Auslosen" : "Umsortieren"}}</div>
            </template>
         </Modal>
      </Transition>

      <!-- GroupsSettings -->
      <GroupsSettings :tournament="tournament" :getTournament="getTournament"/>

      <!-- Buttons -->
      <div class="bp-button" style="margin-bottom: 20px;" @click="toggleModal(true)">Gruppen auslosen</div>
      <div class="bp-button"  @click="toggleModal(false)">Gruppen umsortieren</div>

      <!-- Groups -->
      <table class="table table-hover caption-top" v-for="(group,index) in getGroups(tournament)" :key="index" :id="'Group-' + index">
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
            <tr v-for="(team,id) in group.teams" :key="team">
               <td class="lt-handle">
                  <div style="margin-bottom: 5px; margin-top: 5px;"/>
                  <div/>
               </td>
               <td>{{id+1}}</td>
               <td>{{team ? team.name : "Team nicht gefunden / wurde gelöscht"}}</td>
               <td v-if="team">
                  <span v-for="player in team.players" style="margin-right: 15px" :key="player">{{player}}</span>
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
