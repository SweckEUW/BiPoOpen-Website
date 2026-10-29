<template>
    <div class="MVP">
        
        <div style="text-align: center; font-size: 18px; color: var(--main-color);" v-if="tournament.groupPhase.groups.length == 0">
            Die MVP-Liste ist noch nicht verfügbar
        </div>

        <div v-else>

            <AppTable
                :value="mvpList"
                :rowClass="getRowClass"
                @row-click="onRowClick"
                rank
                sortField="averageHits"
                :sortOrder="-1"
                class="MVP-Table"
            >

                <!-- Name -->
                <Column header="Name" :pt="{ headerCell: { class: '!text-left' }, columnTitle: { class: '!text-left' }, bodyCell: { class: '!text-left' } }">
                    <template #body="slotProps">
                        <div class="flex items-center gap-[8px] !text-left">
                            <Avatar :name="slotProps.data.name" shape="circle" class="mvp-avatar shrink-0 !w-[35px] !h-[35px] !text-[10px]"/>
                            <div class="whitespace-pre-line !text-left">{{ slotProps.data.name }}</div>
                        </div>
                    </template>
                </Column>

                <!-- Trefferquote -->
                <Column field="averageHits" sortable :header="labels.hitRate">
                    <template #body="slotProps">
                        {{ slotProps.data.averageHits.toFixed(2) }}
                    </template>
                </Column>

                <!-- Treffer -->
                <Column field="hits" sortable :header="labels.hits"/>

                <!-- Spiele -->
                <Column field="ammountOfMatches" sortable :header="labels.games"/>

            </AppTable>
        </div>

    </div>
</template>

<script setup lang="ts">
import { computed, inject, PropType } from "vue"
import Column from 'primevue/column';
import Avatar from '@/components/shared/Avatar.vue';
import AppTable from '@/components/shared/AppTable.vue';
import { PODIUM_ROW_CLASSES, useTableLabels } from '@/components/shared/appTable';
import { getMVPList } from "@/util/tournamentPlayerFunctions";

let props = defineProps({
   tournament: {type: Object as PropType<Tournament>, required: true }
});

const labels = useTableLabels();

const mvpList = computed(() => {
    if(props.tournament == undefined)
        return [];

    // getMVPList returns the players ranked by averageHits (tiebreak: drunken cups);
    // PrimeVue's DataTable handles column sorting from here.
    return getMVPList(props.tournament);
})

const openPlayerProfile = inject<(name: string) => void>('openPlayerProfile');

const onRowClick = (event: { data: PlayerWithStats }) => {
    openPlayerProfile?.(event.data.name);
}

const getRowClass = (row:PlayerWithStats) => {
    const index = mvpList.value.indexOf(row);
    if(index > 2) return '';

    return `${PODIUM_ROW_CLASSES[index]} mvp-rank-${index + 1}`;
}
</script>

<style scoped>
/* Absteigende Schriftgröße für die Top 3 – direkt auf die Zellen, damit PrimeVue nicht überschreibt */
.MVP-Table :deep(tr.mvp-rank-1 > td){
    font-size: 24px;
    font-weight: 700;
}
.MVP-Table :deep(tr.mvp-rank-2 > td){
    font-size: 20px;
    font-weight: 600;
}
.MVP-Table :deep(tr.mvp-rank-3 > td){
    font-size: 19px;
    font-weight: 500;
}

/* Label-Avatare nutzen intern opacity:0.7 und erzeugen dadurch einen eigenen
   Stacking-Context, wodurch sie sich beim Scrollen über den Sticky-Header legen.
   opacity entfernen (-> kein Stacking-Context, scrollt hinter den Header wie die
   Bild-Avatare) und den gedämpften Look über eine transluzente Hintergrundfarbe
   nachbilden. */
.MVP-Table :deep(.mvp-avatar){
    opacity: 1 !important;
}
.MVP-Table :deep(.mvp-avatar:not(:has(img))){
    background-color: color-mix(in srgb, var(--main-color) 70%, transparent) !important;
}

/*MOBILE*/
@media (width <= 900px){
    .MVP-Table :deep(tr.mvp-rank-1 > td){ font-size: 15px; }
    .MVP-Table :deep(tr.mvp-rank-2 > td){ font-size: 14px; }
    .MVP-Table :deep(tr.mvp-rank-3 > td){ font-size: 14px; }
    .MVP-Table :deep(.mvp-avatar){ width: 22px !important; height: 22px !important; }
}
</style>