<template>
    <div :class="layout === 'page' ? 'px-[2px] md:px-[8px]' : 'px-[10px]'">
        <div class="flex flex-col items-center" :class="layout === 'page' ? 'mb-[24px] md:mb-[30px]' : 'mb-[30px]'">
            <div class="relative cursor-pointer group mb-[10px]" @click="showImageUpload = true">
                <PlayerProfileAvatar
                    :key="avatarKey"
                    :name="profileData.name"
                    size="xlarge"
                    shape="circle"
                    class="pp-profile-avatar"
                />
                <div class="absolute bottom-[2px] right-[2px] w-[26px] h-[26px] rounded-full bg-[var(--main-color)] flex items-center justify-center shadow-md border-2 border-white">
                    <span class="material-icons text-white !text-[16px]">edit</span>
                </div>
            </div>
            <PlayerProfileImageUpload
                :playerName="profileData.name"
                v-model:visible="showImageUpload"
                @uploaded="onImageUploaded"
            />
            <div
                class="font-bold text-[--p-primary-color]"
                :class="layout === 'page' ? 'text-[30px] md:text-[36px] text-center' : 'text-[32px]'"
            >
                {{ profileData.name }}
            </div>
            <Tag v-if="profileData.leagueTeam" severity="info" :value="'Liga: ' + profileData.leagueTeam" rounded class="mt-[4px]" />
            <PlayerProfileBadges v-if="profileData.badges.length > 0" :badges="profileData.badges" class="mt-[10px]" />
        </div>

        <div class="flex justify-center mb-[16px]">
            <Select
                :modelValue="trendPeriod"
                @update:modelValue="value => $emit('update:trendPeriod', value as TrendPeriod)"
                :options="trendPeriodOptions"
                optionLabel="label"
                optionValue="value"
                class="w-[220px]"
            />
        </div>

        <Divider />

        <Tabs v-model:value="activeTabValue" class="mb-[10px]">
            <TabList class="w-full">
                <Tab value="1v1" class="flex-1 justify-center">1v1 Spiele</Tab>
                <Tab value="2v2" class="flex-1 justify-center">2v2 Spiele</Tab>
            </TabList>
            <TabPanels
                :pt="{
                    root: {
                        style: { '--p-tabs-tabpanel-padding': '0.5rem 0' }
                    }
                }"
            >
                <TabPanel value="1v1">
                    <div v-if="filteredData1v1.totalMatches === 0" class="text-center py-[30px] text-[--p-text-muted-color]">
                        Keine 1v1 Spiele vorhanden
                    </div>
                    <template v-else>
                        <PlayerProfileOverview :data="filteredData1v1" />

                        <Divider />

                        <PlayerProfileAnalysis :data="filteredData1v1" />

                        <Divider />

                        <PlayerProfilePeers
                            :partners="filteredData1v1.partners"
                            :rivals="filteredData1v1.rivals"
                            @openPlayer="(name) => $emit('openPlayer', name)"
                        />

                        <Divider />

                        <PlayerProfileHistory
                            :matchHistory="filteredData1v1.matchHistory"
                            :playerName="profileData.name"
                            :leagueTeam="profileData.leagueTeam"
                        />
                    </template>
                </TabPanel>

                <TabPanel value="2v2">
                    <div v-if="filteredData2v2.totalMatches === 0" class="text-center py-[30px] text-[--p-text-muted-color]">
                        Keine 2v2 Spiele vorhanden
                    </div>
                    <template v-else>
                        <PlayerProfileOverview :data="filteredData2v2" />

                        <Divider />

                        <PlayerProfileAnalysis :data="filteredData2v2" />

                        <Divider />

                        <PlayerProfilePeers
                            :partners="filteredData2v2.partners"
                            :rivals="filteredData2v2.rivals"
                            @openPlayer="(name) => $emit('openPlayer', name)"
                        />

                        <Divider />

                        <PlayerProfileHistory
                            :matchHistory="filteredData2v2.matchHistory"
                            :playerName="profileData.name"
                            :leagueTeam="profileData.leagueTeam"
                        />
                    </template>
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Tag from 'primevue/tag';
import Divider from 'primevue/divider';
import Select from 'primevue/select';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';

import PlayerProfileOverview from './PlayerProfileOverview.vue';
import PlayerProfileAnalysis from './PlayerProfileAnalysis.vue';
import PlayerProfileBadges from './PlayerProfileBadges.vue';
import PlayerProfilePeers from './PlayerProfilePeers.vue';
import PlayerProfileHistory from './PlayerProfileHistory.vue';
import PlayerProfileAvatar from './PlayerProfileAvatar.vue';
import PlayerProfileImageUpload from './PlayerProfileImageUpload.vue';
import { filterProfileDataByGameType } from './PlayerProfileUtilFunctions';
import { fetchPlayerProfileImage } from './PlayerProfileImageMapping';

const props = defineProps<{
    profileData: PlayerProfileData;
    trendPeriod: TrendPeriod;
    trendPeriodOptions: { label: string; value: TrendPeriod }[];
    layout: 'drawer' | 'page';
}>();

defineEmits<{
    (e: 'update:trendPeriod', value: TrendPeriod): void;
    (e: 'openPlayer', name: string): void;
}>();

const activeTabValue = ref('1v1');
const showImageUpload = ref(false);
const avatarKey = ref(0);

const onImageUploaded = () => {
    // Re-fetch backend image and force avatar re-render
    fetchPlayerProfileImage(props.profileData.name).then(() => {
        avatarKey.value++;
    });
};

const filteredData1v1 = computed(() => filterProfileDataByGameType(props.profileData, '1v1'));
const filteredData2v2 = computed(() => filterProfileDataByGameType(props.profileData, '2v2'));
</script>

<style scoped>
.pp-profile-avatar {
    width: 96px;
    height: 96px;
    font-size: 32px;
}

:deep(.p-tablist-tab-list) {
    width: 100%;
}

:deep(.p-tab) {
    flex: 1 1 0;
    justify-content: center;
}
</style>

