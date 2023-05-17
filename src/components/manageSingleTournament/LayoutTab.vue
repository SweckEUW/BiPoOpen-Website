<script setup lang="ts">
import axios from "axios";
import Sortable from "sortablejs";

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
   setGroups(groups);
}

const initSortable = () => {
   setTimeout(() => {
      let groupAmmount:number = props.tournament.groupPhase.settings.fixedGroupAmmount;
      for (let i = 0; i < groupAmmount; i++){
         let groupDOM:any = document.getElementById("Group-"+i);
         let tbody:any = groupDOM.getElementsByTagName("tbody")[0];
         new Sortable(tbody, {
            animation: 150,
            group: 'shared',
            onEnd: onDragEnd,
         });
      }
   }, 500);
}
initSortable();

const generateGroups = async () => {
   await props.getTournament();

   // Generate Groups
   let groups:any = [];
   let teams:any = shuffleArray(props.tournament.teams);

   // Case: Fixed ammount of Groups
   let groupAmmount:number = props.tournament.groupPhase.settings.fixedGroupAmmount;
   for (let i = 0; i < groupAmmount; i++)
      groups.push({teams: []});
   for (let i = 0; i < teams.length; i++)
      groups[i%groupAmmount].teams.push(teams[i]);
   
   // Set Groups in Database
   setGroups(groups);
}

const setGroups = async (groups:any) => {
   let response = await axios.post("/setGroups", {tournamentID: props.tournament._id, groups: groups})
   console.log(response.data.message);
   if(response.data.success){
      props.getTournament();
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
      
      <div class="bp-button" @click="generateGroups()">Gruppen Generieren</div>

      <!-- Groups -->
      <div class="lt-groups">
         <div style="margin-bottom: 20px; font-size: 28px;">Gruppen</div>

         <div class="lt-groups-container">

            <table class="table table-hover caption-top" v-for="(group,index) in props.tournament?.groupPhase?.groups" :id="'Group-' + index" :key="index">
               <caption>{{"Gruppe "+ (index + 1)}}</caption>
               <thead>
                  <tr>
                     <th scope="col">#</th>
                     <th scope="col">Teamname</th>
                     <th scope="col">Spieler</th>
                  </tr>
               </thead>
               <tbody>
                  <tr v-for="(team,id) in group.teams" :key="team">
                     <th scope="row">{{id+1}}</th>
                     <td>{{team.name}}</td>
                     <td>
                        <span v-for="player in team.players" style="margin-right: 15px" :key="player">{{player}}</span>
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>

   </div>
</template>

<style scoped>
.lt-groups{
   margin-top: 50px;
}
table {
   table-layout: fixed;
   word-wrap: break-word;
}
th:first-of-type{
   width: 100px;
}
</style>
