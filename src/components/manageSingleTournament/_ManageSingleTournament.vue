<script setup lang="ts">
import ParticipantsTab from '@/components/manageSingleTournament/ParticipantsTab.vue';
import LayoutTab from '@/components/manageSingleTournament/LayoutTab.vue';
import GameScheduleTab from '@/components/manageSingleTournament/GameScheduleTab.vue';
import ResultsTab from '@/components/manageSingleTournament/ResultsTab.vue';

import axios from "axios";
import { ref } from "vue"
import {useRoute} from "vue-router";

const route = useRoute();
let tournament = ref({name: "", teams: []});
const getTournament = async () => {
   let response = await axios.get("/tournaments")
   console.log(response.data.message);
   if(response.data.success){
      // @ts-ignore
      tournament.value = response.data.tournaments.find((tournament: any) => tournament.name == route.params.id.replaceAll("-"," "));
   }
}
getTournament();
</script>

<template>
   <div class="ManageTournament">
      <h1>{{tournament.name}}</h1>

      <!-- Tabs -->
      <ul class="nav nav-tabs" id="myTab" role="tablist">
         <li class="nav-item" role="presentation">
            <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home-tab-pane" type="button" role="tab" aria-controls="home-tab-pane" aria-selected="true">Teilnehmer</button>
         </li>
         <li class="nav-item" role="presentation">
            <button class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile-tab-pane" type="button" role="tab" aria-controls="profile-tab-pane" aria-selected="false">Layout</button>
         </li>
         <li class="nav-item" role="presentation">
            <button class="nav-link" id="contact-tab" data-bs-toggle="tab" data-bs-target="#contact-tab-pane" type="button" role="tab" aria-controls="contact-tab-pane" aria-selected="false">Spielplan</button>
         </li>
         <li class="nav-item" role="presentation">
            <button class="nav-link" id="result-tab" data-bs-toggle="tab" data-bs-target="#result-tab-pane" type="button" role="tab" aria-controls="result-tab-pane" aria-selected="false">Ergebnisse</button>
         </li>
      </ul>

      <!-- Content -->
      <div class="tab-content">
         <div class="tab-pane fade show active" id="home-tab-pane" role="tabpanel" aria-labelledby="home-tab" tabindex="0">
            <ParticipantsTab :getTournament="getTournament" :tournament="tournament"/>
         </div>
         <div class="tab-pane fade" id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabindex="0">
            <LayoutTab :getTournament="getTournament" :tournament="tournament"/>
         </div>
         <div class="tab-pane fade" id="contact-tab-pane" role="tabpanel" aria-labelledby="contact-tab" tabindex="0">
            <GameScheduleTab :getTournament="getTournament" :tournament="tournament"/>
         </div>
         <div class="tab-pane fade" id="result-tab-pane" role="tabpanel" aria-labelledby="result-tab" tabindex="0">
            <ResultsTab :getTournament="getTournament" :tournament="tournament"/>
         </div>
      </div>

   </div>
</template>

<style scoped>
</style>
