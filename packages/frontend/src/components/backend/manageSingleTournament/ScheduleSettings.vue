<script setup lang="ts">
import { setSettings } from "@/util/tournamentUtilFunctions.js";

const props = defineProps(['getTournament','tournament'])

const setTrackPlayerShots = async (e:any) => {
   let settings = props.tournament.settings;
   settings.trackPlayerShots = e.srcElement.checked;
   let success:boolean = await setSettings(props.tournament._id, settings);
   if(success){
      await props.getTournament();
   }
}

const setTrackTeamShots = async (e:any) => {
   let settings = props.tournament.settings;
   settings.trackTeamShots = e.srcElement.checked;
   let success:boolean = await setSettings(props.tournament._id, settings);
   if(success){
      await props.getTournament();
   }
}
</script>

<template>
   <div class="ScheduleSettings">
      <h1>Einstellungen</h1>

      <div class="ss-setting">
         <div class="ss-title">Würfe einzelner Spieler eintragen?</div>
         <input type="checkbox" class="ss-input" :checked="props.tournament.settings.trackPlayerShots" @input="setTrackPlayerShots">
      </div>

      <div class="ss-setting">
         <div class="ss-title">Würfe der Teams eintragen?</div>
         <input type="checkbox" class="ss-input" :checked="props.tournament.settings.trackTeamShots" @input="setTrackTeamShots">
      </div>
      
      <hr>

   </div>
</template>

<style scoped>
.ScheduleSettings{
   margin-top: 20px;
}
.ss-setting{
   margin-bottom: 20px;
}
.ss-title{
   display: inline-block;
}
.ss-input{
   display: inline-block;
   margin-left: 10px;
}
</style>
