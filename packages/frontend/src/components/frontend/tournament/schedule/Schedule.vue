<script setup lang="ts">
import ScheduleGroups from '@/components/frontend/tournament/schedule/ScheduleGroups.vue';
import ScheduleKO from '@/components/frontend/tournament/schedule/ScheduleKO.vue';
import { PropType } from 'vue';

defineProps({
   getTournament: {type: Function, required: true },
   tournament: {type: Object as PropType<Tournament>, required: true },
   isBackend: {type: Boolean, required: true },
});
</script>

<template>
   <div class="Schedule">

      <div v-if="tournament.groupPhase.groups.length == 0" style="text-align: center; font-size: 18px; color: var(--main-color);">
         Der Spielplan ist noch nicht verfügbar
      </div>

      <div v-else>
         <!-- Tabs -->
         <ul class="nav nav-tabs justify-content-center">
            <li class="nav-item">
               <button class="nav-link active" data-bs-toggle="tab" :data-bs-target="'#GameScheduleGroups' + tournament._id">Gruppenphase</button>
            </li>
            <li class="nav-item">
               <button class="nav-link" data-bs-toggle="tab" :data-bs-target="'#GameScheduleKO' + tournament._id">K.o.Phase</button>
            </li>
         </ul>

         <!-- Content -->
         <div class="tab-content">
            <div class="tab-pane fade show active" :id="'GameScheduleGroups' + tournament._id">
               <ScheduleGroups :getTournament="getTournament" :tournament="tournament" :isBackend="isBackend"/>
            </div>
            <div class="tab-pane fade" :id="'GameScheduleKO' + tournament._id">
               <ScheduleKO :getTournament="getTournament" :tournament="tournament" :isBackend="isBackend"/>
            </div>
         </div>
      </div>

   </div>
</template>

<style scoped>
.nav-tabs{
   position: sticky;
   top: 210px;
   background: white;
   z-index: 2;
}
.nav-link{
   border-radius: 0px;
   width: 40vw;
   padding: 15px 10px;
   color: var(--secondary-color);
   font-weight: bold;
}
.nav-item{
   flex: 1;
}
.nav-item .active{
   background-color: var(--main-color) !important;
   color: white !important;
}
.nav-item button{
   width: 100%;
}
/* MOBILE */
@media (width <= 900px){
   .nav-tabs{
      top: 190px;
   }
   .nav-link{
      font-size: 14px;
      padding: 10px 10px;
   }
}
</style>