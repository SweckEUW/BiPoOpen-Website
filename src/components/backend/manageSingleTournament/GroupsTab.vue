<script setup lang="ts">
import Sortable from "sortablejs";
import { ref, onMounted } from "vue"
import { getGroups, setGroups, generateRandomGroups, generateRandomMatchesGroupPhase, initMatchesKOPhase } from "@/util/tournamentUtilFunctions.js";

import Modal from '@/components/shared/Modal.vue';

const props = defineProps(['getTournament','tournament'])

const onDragEnd = async () => {
   // 1. Construct Groups Array from DOM
   let groups:any = [];

   let groupAmmount:number = props.tournament.groupPhase.settings.fixedGroupAmmount;
   for (let i = 0; i < groupAmmount; i++){
      let teams:any = [];
      let groupDOM:any = document.getElementById("Group-"+i);
      let tbody:any = groupDOM.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
      for (let y = 0; y < tbody.length; y++) {

         let playersDOM = tbody[y].getElementsByTagName("td")[1].getElementsByTagName("span");
         let players:any = [];
         for (let x = 0; x < playersDOM.length; x++)
            players.push(playersDOM[x].innerText);

         teams.push({
            name: tbody[y].getElementsByTagName("td")[0].innerText,
            players: players
         });
      }

      groups.push({teams: teams});
   }

   // 2. Set Groups in Database
   let success:boolean = await setGroups(props.tournament._id, groups);
   if(success){
      await props.getTournament();
      initSortable();
   }
}

const initSortable = () => {
   // setTimeout(() => {
   //    let groupAmmount:number = props.tournament.groupPhase.settings.fixedGroupAmmount;
   //    for (let i = 0; i < groupAmmount; i++){
   //       let groupDOM:any = document.getElementById("Group-"+i);
   //       let tbody:any = groupDOM.getElementsByTagName("tbody")[0];
   //       new Sortable(tbody, {
   //          animation: 150,
   //          group: 'shared',
   //          // onEnd: onDragEnd,
   //       });
   //    }
   // }, 0);
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
   toggleModal();
}

let showModal = ref(false);
const toggleModal = () => {
   showModal.value = !showModal.value;
}
</script>

<template>
   <div class="LayoutTab">

      <Transition name="fade">
         <Modal v-if="showModal">
               <template #title>Gruppen auslosen</template>
               <template #template>
               <p style="text-align: center">Sicher das die Gruppen ausgelost werden sollen?<br>Dadurch wird der Spielplan neu generiert und der alte gelöscht!</p>
               </template>
               <template #cancle>
                  <div @click="toggleModal()">Abbrechen</div>
               </template>
               <template #confirm>
                  <div @click="generateGroups()">Auslosen</div>
               </template>
         </Modal>
      </Transition>

      <div class="bp-button" @click="toggleModal()">Gruppen auslosen</div>

      <table class="table table-hover caption-top" v-for="(group,index) in getGroups(props.tournament)" :key="index" :id="'Group-' + index">
         <caption>{{"Gruppe "+ (index + 1)}}</caption>
         <thead>
            <tr>
               <th>#</th>
               <th>Teamname</th>
               <th>Spieler</th>
            </tr>
         </thead>
         <tbody>
            <tr v-for="(team,id) in group.teams" :key="team">
               <td>{{id+1}}</td>
               <td>{{team.name}}</td>
               <td>
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
table td:nth-child(1){
   max-width: 20px;
   width: 20px;
}
</style>
