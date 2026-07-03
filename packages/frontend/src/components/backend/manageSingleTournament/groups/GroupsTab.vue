<template>
   <div class="LayoutTab">

      <Loadingscreen v-show="displayLoading"/>

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
            <tr class="text-left"> 
               <th></th>
               <th>#</th>
               <th>Team</th>
               <th>Spieler</th>
            </tr>
         </thead>
         <tbody>
            <tr v-for="(team,id) in group.teams" :key="team._id" class="text-left">
               <td class="lt-handle">
                  <div style="margin-bottom: 5px; margin-top: 5px;"/>
                  <div/>
               </td>
               <td>{{id+1}}</td>
               <td class="flex">
                  <PlayerProfileAvatar class="mr-[10px]" :name="team.name!" :avatarImage="team.logo" :size="'xlarge'"/>
                  <div>{{team ? team.name : "Team nicht gefunden / wurde gelöscht"}}</div>
               </td>
               <td v-if="team">
                  <span v-for="player in team.players" class="mr-[15px]">{{player.name}}</span>
               </td>
            </tr>
         </tbody>
      </table>

   </div>
</template>

<script setup lang="ts">
import Sortable from "sortablejs";
import { ref, onMounted, PropType } from "vue"
import { convertNumberToCharacter } from "@/util/util"; 
import Modal from '@/components/shared/Modal.vue';
import GroupsSettings from '@/components/backend/manageSingleTournament/groups/GroupsSettings.vue';
import { getTeamFromName } from "@/util/tournamentTeamFunctions";
import { generateRandomGroups, generateRandomMatchesGroupPhase, setGameResultGroupPhase, setGroups } from "@/util/tournamentGroupFunctions";
import { initMatchesKOPhase } from "@/util/tournamentKOPhaseFunctions";
import { useToast } from "primevue";
import Loadingscreen from '@/components/shared/Loadingscreen.vue';
import PlayerProfileAvatar from '@/components/frontend/playerProfile/PlayerProfileAvatar.vue';

const props = defineProps({
   getTournament: {type: Function, required: true },
   tournament: {type: Object as PropType<Tournament>, required: true }
});

const toast = useToast();

onMounted(() => {
   if(props.tournament.groupPhase.groups)
      initSortable();
});

let displayLoading= ref(false);

const changeGroups = async () => {
   displayLoading.value = true;

   // 1. Construct Groups Array from DOM
   let groups:Group[] = [];

   let groupAmmount = props.tournament.settings.fixedGroupAmmount;
   for (let i = 0; i < groupAmmount; i++){ // Loop over all Groups
      let teams:{teamID: string}[] = [];
      let teamsDomElment = document.getElementById("Group-"+i)!.getElementsByTagName("tbody")[0].getElementsByTagName("tr"); // Get Dom Element of each Group containing Teamname
      for (let y = 0; y < teamsDomElment.length; y++) {
         let teamID = getTeamFromName(props.tournament, teamsDomElment[y].getElementsByTagName("td")[2].getElementsByTagName("div")[1].innerText)!._id;
         teams.push({teamID: teamID});
      }

      // @ts-ignore
      groups.push({teams: teams});
   }

   // 2. Set Groups in Database
   let success = await setGroups(props.tournament._id, groups);
   if(success)
      await initGroupAndKOMatches();

   displayLoading.value = false;

   toast.add({ severity: 'success', summary: 'Erfolg', detail: 'Gruppen wurden umsortiert & Matches wurden neu generiert', life: 3000 });
}

const generateRandomGroupsHere = async () => {
   displayLoading.value = true;

   await generateRandomGroups(props.tournament);
   await initGroupAndKOMatches();

   displayLoading.value = false;

   toast.add({ severity: 'success', summary: 'Erfolg', detail: 'Zufällige Gruppen wurden erstellt & Matches wurden neu generiert', life: 3000 });
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
   props.tournament.groupPhase.matches.forEach(async (groupMatches) => {
      groupMatches.forEach(async (match) => {
         let team1Won = Math.random() > 0.5;
         match.team1.players[0].score = team1Won ? 10 : Math.floor(Math.random() * 9);
         match.team1.players[1].score = Math.floor(Math.random() * 9);
         match.team2.players[0].score = team1Won ? Math.floor(Math.random() * 9) : 10;
         match.team2.players[1].score = Math.floor(Math.random() * 9);
         await setGameResultGroupPhase(props.tournament, match);
      });
   });
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
         if(!groupDOM) continue;
         let tbody = groupDOM.getElementsByTagName("tbody")[0];
         if(!tbody) continue;
         new Sortable(tbody, {
            animation: 150,
            group: 'shared',
            handle: ".lt-handle"
         });
      }
   }, 0);
}
</script>

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
