<script setup lang="ts">
import axios from "axios";
import {ref} from "vue"
import {useRoute} from "vue-router";

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

const setGroups = async () => {
   await getTournament();

   // Generate Groups
   let groups:any = [];
   let teams:any = shuffleArray(tournament.value.teams);

   // Case: Fixed ammount of Groups
   let groupAmmount:number = tournament.value.settings.groupPhase.fixedGroupAmmount;
   for (let i = 0; i < groupAmmount; i++)
      groups.push([]);
   for (let i = 0; i < teams.length; i++)
      groups[i%groupAmmount].push(teams[i]);
   

   // // Case: Fixed ammount of Players in Group
   // let groupSize:number = tournament.value.settings.groupPhase.groupSize;
   // let group:any = [];
   // for (let i = 0; i < teams.length; i++) {
   //    group.push(teams[i]);
   //    if(i % groupSize == groupSize-1){
   //       groups.push(group);
   //       group = [];
   //    }
   // }
   // // Edgecase: Teams not perfectly 
   // if(teams.length % groupSize == 0){

   // }
   
   let response = await axios.post("/setGroups", {tournamentID: tournament.value._id, groups: groups})
   console.log(response.data.message);
   if(response.data.success){
      getTournament();
   }     
}

const shuffleArray = (array:any) => {
   for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
   }

   return array;
}
</script>

<template>
   <div class="LayoutTab">

      <!-- TODO: Einstellung von Optionen (Gruppengröße) -->
      <!-- <div>{{"Teilnehmer pro Gruppe: " + tournament.value?.settings.groupPhase.groupSize}}</div> -->
      
      <div class="lt-button" @click="setGroups()">Gruppen Generieren</div>

      <!-- Groups -->
      <div class="lt-groups">
         <div style="margin-bottom: 20px; font-size: 28px;">Groups</div>

         <div class="lt-groups-container">

            <table class="table table-hover caption-top" v-for="(group,index) in tournament.groups" :key="index">
               <caption>{{"Gruppe "+ (index + 1)}}</caption>
               <thead>
                  <tr>
                     <th scope="col">#</th>
                     <th scope="col">Teamname</th>
                     <th scope="col">Spieler</th>
                  </tr>
               </thead>
               <tbody>
                  <tr v-for="(team, id) in group" :key="id">
                     <th scope="row">{{id + 1}}</th>
                     <td>{{team.name}}</td>
                     <td>
                        <span v-for="player in team.players" :key="player" style="margin-right: 15px">{{player}}</span>
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>

   </div>
</template>

<style scoped>
.lt-button{
   padding: 20px;
   background: purple;
   cursor: pointer;
   color: white;
   text-align: center;
   margin-bottom: 50px;
}
.lt-button:hover{
   background: rgb(80, 0, 80);
}
.lt-groups{
   margin-top: 50px;
}
.lt-groups-container{
   /* display: flex; */
}
</style>
