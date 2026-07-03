<template>
   <div class="ManageTournament" v-if="tournament">
      <h1 class="mt-title">{{ 'Turnier: ' + tournament.name}}</h1>

      <!-- Tabs -->
      <Tabs v-model:value="place">
         <TabList>
            <Tab value="Teams">Teams</Tab>
            <Tab value="Gruppen">Gruppen</Tab>
            <Tab value="GruppenPhase">GruppenPhase</Tab>
            <Tab value="KOPhase">K.o.Phase</Tab>
         </TabList>
         <TabPanels class="!p-[0px]">
            <TabPanel value="Teams">
               <TeamsTab :getTournament="getTournament" :tournament="tournament"/>
            </TabPanel>
            <TabPanel value="Gruppen">
               <GroupsTab :getTournament="getTournament" :tournament="tournament"/>
            </TabPanel>
            <TabPanel value="GruppenPhase">
               <ScheduleSettings :getTournament="getTournament" :tournament="tournament"/>
               <ScheduleGroups :getTournament="getTournament" :tournament="tournament" :isBackend="true"/>
            </TabPanel>
            <TabPanel value="KOPhase">
               <KOSchedule :tournament="tournament"/>
            </TabPanel>
         </TabPanels>
      </Tabs>

   </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRoute } from "vue-router";
import TeamsTab from '@/components/backend/manageSingleTournament/TeamsTab.vue';
import ScheduleSettings from '@/components/backend/manageSingleTournament/ScheduleSettings.vue';
import GroupsTab from '@/components/backend/manageSingleTournament/groups/GroupsTab.vue';
import { getTournamentByName } from "@/util/tournamentFunctions";
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import ScheduleGroups from '@/components/frontend/tournament/ScheduleGroups.vue';
import KOSchedule from '@/components/frontend/tournament/KOSchedule.vue';

let tournament = ref<Tournament|undefined>();
let place = ref<"Teams"|"Gruppen"|"Spielplan">("Teams");

const route = useRoute();
const getTournament = async () => {
   let tournamentName = (route.params.TournamentName as string).replaceAll("-"," ");
   tournament.value = await getTournamentByName(tournamentName);
}
getTournament();
</script>