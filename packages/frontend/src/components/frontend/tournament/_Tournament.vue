
<template>
    <div class="Tournament">

        <Loadingscreen v-if="!tournament"/>

        <div v-if="tournament && tournament.groupPhase.groups">

            <h1 class="bp-title">{{ tournament.name }}</h1>

            <!-- Tabs -->
            <Tabs v-model:value="place" @update:value="changeRouter">
               <TabList class="pb-[20px]">
                  <Tab value="Gruppenphase">Gruppenphase</Tab>
                  <Tab value="K.o.Phase">K.o.Phase</Tab>
                  <Tab v-if="tournament.settings.trackPlayerShots" value="MVP">MVP</Tab>
                  <Tab v-if="getTournamentPhotos()" value="Fotos">Fotos</Tab>
               </TabList>
               <TabPanels class="!p-[0px]">
                  <TabPanel value="Gruppenphase">
                     <ScheduleGroups :getTournament="getTournament" :tournament="tournament" :isBackend="false"/>
                  </TabPanel>
                  <TabPanel value="K.o.Phase">
                     <KOSchedule :tournament="tournament"/>
                  </TabPanel>
                  <TabPanel v-if="tournament.settings.trackPlayerShots" value="MVP">
                     <MVP :tournament="tournament"/>
                  </TabPanel>
                  <TabPanel v-if="getTournamentPhotos()" value="Fotos">
                     <Photos :tournamentPhotos="getTournamentPhotos()"/>
                  </TabPanel>
               </TabPanels>
            </Tabs>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, Ref } from "vue"
import { getTournamentByName } from "@/util/tournamentFunctions"
import ScheduleGroups from '@/components/frontend/tournament/ScheduleGroups.vue';
import KOSchedule from '@/components/frontend/tournament/KOSchedule.vue';
import MVP from '@/components/frontend/tournament/MVP.vue';
import Photos from '@/components/frontend/tournament/photos/_Photos.vue';
import Loadingscreen from '@/components/shared/Loadingscreen.vue';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';

import { useRoute } from "vue-router";
const route = useRoute()

let tournament = ref<Tournament|undefined>();

let place:Ref<"Gruppenphase"|"K.o.Phase"|"Teams"|"MVP"|"Fotos"> = ref("Gruppenphase");
let name = route.path.split("/").pop();
if(name == "Gruppenphase")
   place.value = "Gruppenphase";
else if(name == "K.o.Phase")
   place.value = "K.o.Phase";
else if(name == "MVP")
   place.value = "MVP";
else if(name == "Fotos")
   place.value = "Fotos";

const getTournament = async () => {
   tournament.value = await getTournamentByName(route.params.TournamentName as string);
}
getTournament()

let updateInterval = setInterval(() => {
   getTournament();
}, 10000);

onUnmounted(() => {
   clearInterval(updateInterval);
});

const changeRouter = (path:string|number) => {
   let newURL = window.location.origin + "/" + route.params.TournamentName + '/' + path;
   window.history.replaceState({ ...window.history.state, as: newURL, url: newURL }, '', newURL);
   window.scrollTo({top: 0, behavior: 'instant' });
};

const getTournamentPhotos = () => {
   if(tournament.value!.name == "Weck BiPo Open 2025"){
      return {
			driveImageIDs: new URL(`/src/assets/2025/driveImageIDs.json`, import.meta.url),
			poster: new URL(`/src/assets/2025/poster.png`, import.meta.url),
         text: `
            Ein riesiges Dankeschön geht an Patrik Finger, der auch beim Weck BiPo Open 2025 als Fotograf mit am Start war.
            <br>
            Schaut gern auf seinem Instagram-Profil vorbei:
            <a href="https://www.instagram.com/fingerontrigger" target="_blank">@fingerontrigger</a>
         `
		}
   }

   if(tournament.value!.name == "Weck BiPo Open 2024"){
      return {
			driveImageIDs: new URL(`/src/assets/2024/driveImageIDs.json`, import.meta.url),
			poster: new URL(`/src/assets/2024/poster.jpg`, import.meta.url),
         text: `
            Ein großes Dankeschön an Patrik Finger, der am Weck BiPo Open 2024 wieder als Fotograf tätig war. 
            <br>
            Folgt ihm gerne auf Instagram 
            <a href="https://www.instagram.com/fingerontrigger" target="_blank">@fingerontrigger</a>  
         `
		}
   }

   if(tournament.value!.name == "Weck BiPo Open 2023"){
      return {
			driveImageIDs: new URL(`/src/assets/2023/driveImageIDs.json`, import.meta.url),
			poster: new URL(`/src/assets/2023/poster.jpg`, import.meta.url),
         text: `
            Ein großes Dankeschön an Patrik Finger, der am Weck BiPo Open 2023 über 1500 Fotos geschossen hat. 
            <br>
            Folgt ihm gerne auf Instagram 
            <a href="https://www.instagram.com/fingerontrigger" target="_blank">@fingerontrigger</a>
         `
		}
   }

   if(tournament.value!.name == "Weck BiPo Open 2022"){
      return {
            driveImageIDs: new URL(`/src/assets/2022/driveImageIDs.json`, import.meta.url),
            poster: new URL(`/src/assets/2022/poster.jpg`, import.meta.url)
         }
   }

   if(tournament.value!.name == "Weck BiPo Open 2021"){
      return {
            driveImageIDs:  new URL(`/src/assets/2021/driveImageIDs.json`, import.meta.url),
            poster: new URL(`/src/assets/2021/poster.jpg`, import.meta.url)
         }
   }

   if(tournament.value!.name == "Weck BiPo Open 2020"){
      return {
            driveImageIDs:  new URL(`/src/assets/2020/driveImageIDs.json`, import.meta.url),
            poster: new URL(`/src/assets/2020/poster.jpg`, import.meta.url)
         }
   }
}
</script>

<style scoped>
:deep(.p-tablist){
   position: sticky;
   top: 160px;
   background: white;
   z-index: 2;
}
:deep(.p-tabs){
   padding-bottom: 30px;
}
:deep(.p-tab){
   padding: 15px 10px;
   font-weight: bold;
}
/* MOBILE */
@media (width <= 900px){
   :deep(.p-tablist){
      top: 140px;
   }
   :deep(.p-tab){
      font-size: 14px;
      padding: 10px 10px;
   }
}
</style>