<script setup lang="ts">
import axios from "axios";
import { ref } from "vue"
import {useRoute} from "vue-router";

import Modal from '@/components/shared/Modal.vue';

const route = useRoute();
let tournament = ref({name: "", teams: []});
const getTournament = async () => {
   let response = await axios.get("/tournaments")
   console.log(response.data.message);
   if(response.data.success){
      tournament.value = response.data.tournaments.find((tournament: any) => tournament.name == route.params.id.replaceAll("-"," "));
   }     
}
getTournament();

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
   const addTeam = async () => {
   let teamname = teamnameInput.value;
   let players = [player1Input.value, player2Input.value];
   let response = await axios.post("/addTeam", {tournamentID: tournament.value._id, team: {name: teamname, players: players}})
   console.log(response.data.message);
   if(response.data.success){
      getTournament();
      toggleModalCreateTeam();
   }
}

let selectedTeam = ref();
const editTeam = async () => {
   let teamname = teamnameInput.value;
   let players = [player1Input.value, player2Input.value];
   let response = await axios.post("/editTeam", {tournamentID: tournament.value._id, selectedTeamName: selectedTeam.value.name, team: {name: teamname, players: players}})
   console.log(response.data.message);
   if(response.data.success){
      getTournament();
      toggleModalEditTeam();
   }
}

const removeTeam = async () => {
   let response = await axios.post("/removeTeam", {tournamentID: tournament.value._id, selectedTeamName: selectedTeam.value.name});
   console.log(response.data.message);
   if(response.data.success){
      getTournament();
      toggleModalEditTeam();
   }
}
</script>

<template>
   <div class="ParticipantsTab">
      
      <div class="pt-create" @click="toggleModalCreateTeam()">Team hinzufügen</div>

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
                    <div @click="addTeam()">Hinzufügen</div>
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

                    <button @click="removeTeam()">Team löschen</button>
                </template>
                <template #cancle>
                    <div @click="toggleModalEditTeam()">Abbrechen</div>
                </template>
                <template #confirm>
                    <div @click="editTeam()">Bearbeiten</div>
                </template>
            </Modal>
        </Transition>

      <table class="table table-hover">
         <thead>
            <tr>
               <th scope="col">#</th>
               <th scope="col">Teamname</th>
               <th scope="col">Spieler</th>
            </tr>
         </thead>
         <tbody>
            <tr v-for="(team, id) in tournament.teams" :key="team.name" @click="toggleModalEditTeam(team)">
               <th scope="row">{{ id + 1 }}</th>
               <td>{{team.name}}</td>
               <td>
                  <span v-for="player in team.players" :key="player" style="margin-right: 15px">{{player}}</span>
               </td>
            </tr>
         </tbody>
      </table>

   </div>
</template>

<style scoped>
.pt-create{
   padding: 20px;
   background: purple;
   cursor: pointer;
   color: white;
   text-align: center;
   margin-bottom: 50px;
}
.pt-create:hover{
   background: rgb(80, 0, 80);
}
</style>
