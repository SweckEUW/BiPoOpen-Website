<script setup lang="ts">
import { setSettings } from "@/util/tournamentUtilFunctions.js";
import { PropType } from "vue";

const props = defineProps({
   getTournament: {type: Function, required: true },
   tournament: {type: Object as PropType<Tournament>, required: true }
});

const setTrackPlayerShots = async (e:Event) => {
   let inputElement = e.target as HTMLInputElement;
   let settings = props.tournament.settings;
   settings.trackPlayerShots = inputElement.checked;
   let success = await setSettings(props.tournament._id, settings);
   if(success)
      await props.getTournament();
}

const setTrackTeamShots = async (e:Event) => {
   let inputElement = e.target as HTMLInputElement;
   let settings = props.tournament.settings;
   settings.trackTeamShots = inputElement.checked;
   let success = await setSettings(props.tournament._id, settings);
   if(success)
      await props.getTournament();
}
</script>

<template>
   <div class="ScheduleSettings">
      <h1>Einstellungen</h1>

      <div class="ss-setting">
         <div class="ss-title">Würfe einzelner Spieler eintragen?</div>
         <input type="checkbox" class="ss-input" :checked="props.tournament.settings.trackPlayerShots" @input="setTrackPlayerShots($event)">
      </div>

      <div class="ss-setting">
         <div class="ss-title">Würfe der Teams eintragen?</div>
         <input type="checkbox" class="ss-input" :checked="props.tournament.settings.trackTeamShots" @input="setTrackTeamShots($event)">
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
