<script setup lang="ts">
import ScheduleGroups from '@/components/shared/schedule/ScheduleGroups.vue';
import ScheduleKO from '@/components/shared/schedule/ScheduleKO.vue';

defineProps(['getTournament','tournament',"isBackend"])
</script>

<template>
   <div class="Schedule">
      <!-- Tabs -->
      <ul class="nav nav-tabs  justify-content-center" id="myTab" role="tablist">
         <li class="nav-item" role="presentation">
            <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#GameScheduleGroups" type="button" role="tab" aria-controls="home-tab-pane" aria-selected="true">Gruppenphase</button>
         </li>
         <li class="nav-item" role="presentation">
            <button class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#GameScheduleKO" type="button" role="tab" aria-controls="profile-tab-pane" aria-selected="false">K.o.Phase</button>
         </li>
      </ul>

      <!-- Content -->
      <div class="tab-content">
         <div class="tab-pane fade show active" id="GameScheduleGroups" role="tabpanel" aria-labelledby="home-tab" tabindex="0">
            <ScheduleGroups :getTournament="getTournament" :tournament="tournament" :isBackend="isBackend"/>
         </div>
         <div class="tab-pane fade" id="GameScheduleKO" role="tabpanel" aria-labelledby="profile-tab" tabindex="0">
            <ScheduleKO :getTournament="getTournament" :tournament="tournament" :isBackend="isBackend"/>
         </div>
      </div>
   </div>
</template>

<style scoped>
.Schedule{
   margin-top: 50px;
}
</style>
