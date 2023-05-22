<script setup lang="ts">
import { ref } from "vue"
import { addTeam, editTeam, removeTeam } from "@/util/tournamentUtilFunctions.js";

import Modal from '@/components/shared/Modal.vue';

const props = defineProps(['getTournament','tournament'])

const clearInputs = () => {
   teamnameInput.value = "";
   player1Input.value = "";
   player2Input.value = "";
}

let showModalCreateTeam = ref(false);
const toggleModalCreateTeam = () => {
   if(!showModalCreateTeam.value)
      clearInputs();

   showModalCreateTeam.value = !showModalCreateTeam.value;
}

let showModalEditTeam = ref(false);
const toggleModalEditTeam = (team?: any) => {
   if(team){
      teamnameInput.value = team.name;
      player1Input.value = team.players[0];
      player2Input.value = team.players[1];

      selectedTeam.value = team;
   }

   showModalEditTeam.value = !showModalEditTeam.value;
}

let teamnameInput = ref("");
let player1Input = ref("");
let player2Input = ref("");

const addTeamButton = async () => {
   let team:any = {name: teamnameInput.value, players: [player1Input.value, player2Input.value]}
   let success:boolean = await addTeam(props.tournament._id, team);
   if(success){
      await props.getTournament();
      toggleModalCreateTeam();
   }
}

let selectedTeam = ref();
const editTeamButton = async () => {
   let team:any = {name: teamnameInput.value, players: [player1Input.value, player2Input.value], _id: selectedTeam.value._id}
   let success:boolean = await editTeam(props.tournament._id, team);
   if(success){
      await props.getTournament();
      toggleModalEditTeam();
   }
}

const removeTeamButton = async () => {
   let success:boolean = await removeTeam(props.tournament._id, selectedTeam.value._id);
   if(success){
      props.getTournament();
      toggleModalEditTeam();
   }
}
</script>

<template>
   <div class="ParticipantsTab">
      
      <div class="bp-button" @click="toggleModalCreateTeam()">Team hinzufügen</div>

      <!-- Add -->
      <Transition name="fade">
            <Modal v-if="showModalCreateTeam">
                <template #title>Team hinzufügen</template>
                <template #template>
                  <div>Teamname</div>
                    <input type="text" v-model="teamnameInput">

                    <div>Spieler 1</div>
                    <input type="text" v-model="player1Input">

                    <div>Spieler 2</div>
                    <input type="text" v-model="player2Input">
                </template>
                <template #cancle>
                    <div @click="toggleModalCreateTeam()">Abbrechen</div>
                </template>
                <template #confirm>
                    <div @click="addTeamButton()">Hinzufügen</div>
                </template>
            </Modal>
        </Transition>

        <!-- Edit -->
        <Transition name="fade">
            <Modal v-if="showModalEditTeam">
                <template #title>Team Bearbeiten</template>
                <template #template>
                  <div>Teamname</div>
                    <input type="text" v-model="teamnameInput">

                    <div>Spieler 1</div>
                    <input type="text" v-model="player1Input">

                    <div>Spieler 2</div>
                    <input type="text" v-model="player2Input">

                    <button @click="removeTeamButton()">Team löschen</button>
                </template>
                <template #cancle>
                    <div @click="toggleModalEditTeam()">Abbrechen</div>
                </template>
                <template #confirm>
                    <div @click="editTeamButton()">Bearbeiten</div>
                </template>
            </Modal>
        </Transition>

      <table class="table table-hover">
         <thead>
            <tr>
               <th>#</th>
               <th>Teamname</th>
               <th>Spieler</th>
            </tr>
         </thead>
         <tbody>
            <tr v-for="(team, id) in tournament.teams" @click="toggleModalEditTeam(team)" :key="team.name">
               <td>{{ id + 1 }}</td>
               <td>{{ team.name }}</td>
               <td>
                  <span v-for="player in team.players" style="margin-right: 15px" :key="player">{{ player }}</span>
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
   text-align: center;
}
table th{
   font-size: 20px;
   font-weight: bold;
}
table td{
   cursor: pointer;
}
table td:nth-child(1){
   max-width: 20px;
   width: 20px;
}
</style>
