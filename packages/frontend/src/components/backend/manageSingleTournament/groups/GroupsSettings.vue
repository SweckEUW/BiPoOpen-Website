<script setup lang="ts">
import { setSettings } from "@/tournamentFunctions/tournamentFunctions.js";
import { PropType } from "vue";
import { Tournament } from "@/types";

const props = defineProps({
   getTournament: {type: Function, required: true },
   tournament: {type: Object as PropType<Tournament>, required: true }
});

const setFixedGroupAmmountOnInput = async (e:FocusEvent) => {
   let inputElement = e.target as HTMLInputElement;
   let settings = props.tournament.settings;
   settings.fixedGroupAmmount = parseInt(inputElement.value);
   let success:boolean = await setSettings(props.tournament._id, props.tournament.settings);
   if(success)
      await props.getTournament();
}

const setAdvancingTeamsPerGroup = async (e:FocusEvent) => {
   let inputElement = e.target as HTMLInputElement;
   let settings = props.tournament.settings;
   settings.advancingTeamsPerGroup = parseInt(inputElement.value);
   let success:boolean = await setSettings(props.tournament._id, props.tournament.settings);
   if(success)
      await props.getTournament();
}
</script>

<template>
   <div class="GroupsSettings">
      <h1>Einstellungen</h1>

      <div class="gs-setting">
         <div class="gs-title">Anzahl Gruppen</div>
         <input class="gs-input" type="number" :value="props.tournament.settings.fixedGroupAmmount" @focusout="setFixedGroupAmmountOnInput($event)">
      </div>

      <div class="gs-setting">
         <div class="gs-title">Advancing Teams pro Gruppe</div>
         <input class="gs-input" type="number" :value="props.tournament.settings.advancingTeamsPerGroup" @focusout="setAdvancingTeamsPerGroup($event)">
      </div>
      
      <hr>

   </div>
</template>

<style scoped>
.GroupsSettings{
   margin-top: 20px;
}
.gs-setting{
   margin-bottom: 20px;
}
.gs-title{
   display: inline-block;
}
.gs-input{
   display: inline-block;
   margin-left: 10px;
   width: 50px;
   text-align: center;
}
</style>
