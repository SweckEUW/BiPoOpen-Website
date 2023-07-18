<script setup lang="ts">
import { setSettings } from "@/util/tournamentUtilFunctions.js";

const props = defineProps(['getTournament','tournament'])

const setFixedGroupAmmountOnInput = async (e:any) => {
   let settings = props.tournament.settings;
   settings.fixedGroupAmmount = e.srcElement.value;
   let success:boolean = await setSettings(props.tournament._id, settings);
   if(success){
      await props.getTournament();
   }
}
</script>

<template>
   <div class="GroupsSettings">
      <h1>Einstellungen</h1>

      <div class="gs-setting">
         <div class="gs-title">Anzahl Gruppen</div>
         <input class="gs-input" type="number" :value="props.tournament.settings.fixedGroupAmmount" @focusout="setFixedGroupAmmountOnInput">
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
