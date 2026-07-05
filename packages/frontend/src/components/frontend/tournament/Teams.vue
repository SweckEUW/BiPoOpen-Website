<template>
    <DataTable
        :value="teams"
        :pt="{
            tableContainer: {
                class: '!overflow-visible'
            }
        }"
        stripedRows
        class="w-full max-[900px]:text-[14px] max-[360px]:text-[13px] mb-[30px]"
    >

        <!-- Nummer -->
        <Column header="Nr." :pt="{ headerCell: { class: '!px-1 !w-[26px] !max-w-[26px]' }, bodyCell: { class: '!p-1 !w-[26px] !max-w-[26px]' } }">
            <template #body="slotProps">
                {{ slotProps.index + 1 }}
            </template>
        </Column>

        <!-- Team -->
        <Column header="Team" :pt="{ headerCell: { class: '!text-left' }, columnTitle: { class: '!text-left' }, bodyCell: { class: '!text-left' } }">
            <template #body="slotProps">
                <div class="flex items-center justify-start">
                    <Image
                        v-if="slotProps.data.logo"
                        class="team-logo-preview min-w-[65px] max-w-[65px] max-[600px]:min-w-[50px] max-[600px]:max-w-[50px] max-[400px]:min-w-[40px] max-[400px]:max-w-[40px] mr-[10px] max-[400px]:mr-[6px]"
                        :src="slotProps.data.logo"
                        preview
                        :pt="{
                            toolbar: { style: 'display: none' },
                            previewMask: { style: 'background: transparent; opacity: 0' },
                            mask: { style: 'background-color: rgba(0, 0, 0, 0.9) !important' }
                        }"
                    />
                    <PlayerProfileAvatar v-else class="min-w-[65px] min-h-[65px] max-[600px]:min-w-[50px] max-[600px]:min-h-[50px] max-[400px]:min-w-[40px] max-[400px]:min-h-[40px] mr-[10px] max-[400px]:mr-[6px]" :name="slotProps.data.name" :avatarImage="slotProps.data.logo" :shape="'square'"/>
                    <div class="!text-left whitespace-normal break-words leading-tight" :class="getNameSizeClass(slotProps.data.name)">{{ slotProps.data.name }}</div>
                </div>
            </template>
        </Column>

        <!-- Spieler -->
        <Column header="Spieler" :pt="{ headerCell: { class: '!text-left' }, columnTitle: { class: '!text-left' }, bodyCell: { class: '!text-left' } }">
            <template #body="slotProps">
                <div class="flex flex-col items-start">
                    <span v-for="player in slotProps.data.players" :key="player._id" class="block text-left whitespace-nowrap">{{ player.name }}</span>
                </div>
            </template>
        </Column>

    </DataTable>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, PropType, computed, ref } from "vue"
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Image from 'primevue/image';
import PlayerProfileAvatar from '@/components/frontend/playerProfile/PlayerProfileAvatar.vue';
import { getAllTeams } from '@/util/tournamentTeamFunctions';

const props = defineProps({
   tournament: {type: Object as PropType<Tournament>, required: true },
})

const teams = computed(() => getAllTeams(props.tournament));

const getNameSizeClass = (name: string) => {
    const length = name?.length ?? 0;

    if (length > 40) return 'text-[11px] max-[900px]:text-[10px]';
    if (length > 28) return 'text-[13px] max-[900px]:text-[12px]';
    if (length > 20) return 'text-[15px] max-[900px]:text-[13px]';

    return '';
};

const windowWidth = ref(window.screen.width);

const updateWindowWidth = () => {
    windowWidth.value = window.screen.width;
};

onMounted(() => {
    window.addEventListener('resize', updateWindowWidth);
});

onUnmounted(() => {
    window.removeEventListener('resize', updateWindowWidth);
});
</script>

<style scoped>
.team-logo-preview :deep(img) {
    width: 100%;
    height: auto;
    object-fit: contain;
    cursor: pointer;
}
</style>
