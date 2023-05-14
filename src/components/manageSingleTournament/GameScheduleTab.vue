<script setup lang="ts">
import axios from "axios";
import {ref} from "vue"
import {useRoute} from "vue-router";

import draggable from 'vuedraggable'

let drag = ref(false);

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

const getMatchesForGroup = () => {
   
}
</script>

<template>
   <div class="GameScheduleTab">

      <!-- Instead of 8: tournament.value?.settings.groupPhase.fixedGroupAmmount -->
      <div class="gst-table" v-for="i in 8" :key="i">
         <div>{{ "Tisch " +  i}}</div>
         <!-- TOOD: Add maches for group -->
         <!-- <draggable v-model="" :group="i" @start="drag=true" @end="drag=false">
            <template #item="{element}">
               <div class="gst-match">{{element.name}}</div>
               <table></table>
               </template>
         </draggable> -->
      </div>
   </div>
</template>

<style scoped>
.gst-table{

}
.gst-match{
   padding: 10px;
   outline: 1px solid black;
   margin-bottom: 5px;
   cursor: pointer;
}
</style>
