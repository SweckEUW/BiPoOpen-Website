<template>
    <div class="MVP">
        
        <div style="text-align: center; font-size: 18px; color: var(--main-color);" v-if="tournament.groupPhase.groups.length == 0">
            Die MVP-Liste ist noch nicht verfügbar
        </div>

        <div v-else>

            <DataTable
                :value="mvpList"
                :rowClass="getRowClass"
                @row-click="onRowClick"
                :pt="{
                    tableContainer: {
                        class: '!overflow-visible'
                    }
                }"
                sortField="averageHits"
                :sortOrder="-1"
                class="MVP-Table w-full max-[900px]:text-[14px] max-[360px]:text-[13px]"
            >

                <!-- Platz -->
                <Column :header="windowWidth > 900 ? 'Platz' : 'Pl.'" :pt="{ headerCell: { class: 'mvp-sticky-header !px-1 !w-[26px] !max-w-[26px]' }, bodyCell: { class: '!p-1 !w-[26px] !max-w-[26px]' } }">
                    <template #body="slotProps">
                        {{ slotProps.data.placement! + 1 }}
                    </template>
                </Column>

                <!-- Name -->
                <Column header="Name" :pt="{ headerCell: { class: 'mvp-sticky-header !text-left z-9999' }, columnTitle: { class: '!text-left' }, bodyCell: { class: '!text-left' } }">
                    <template #body="slotProps">
                        <div class="flex items-center gap-[8px] !text-left">
                            <Avatar :name="slotProps.data.name" shape="circle" class="mvp-avatar shrink-0 !w-[35px] !h-[35px] !text-[10px]"/>
                            <div class="whitespace-pre-line !text-left">{{ slotProps.data.name }}</div>
                        </div>
                    </template>
                </Column>

                <!-- Trefferquote -->
                <Column field="averageHits" sortable :header="windowWidth > 900 ? 'Trefferquote' : 'Trfq.'" :pt="{ headerCell: { class: 'mvp-sticky-header' } }">
                    <template #body="slotProps">
                        {{ slotProps.data.averageHits.toFixed(2) }}
                    </template>
                </Column>

                <!-- Treffer -->
                <Column field="hits" sortable :header="windowWidth > 900 ? 'Treffer' : 'Trf.'" :pt="{ headerCell: { class: 'mvp-sticky-header' } }"/>

                <!-- Spiele -->
                <Column field="ammountOfMatches" sortable :header="windowWidth > 900 ? 'Spiele' : 'Spi.'" :pt="{ headerCell: { class: 'mvp-sticky-header' } }"/>

                <!-- Getrunkene Becher -->
                <!-- <Column v-if="windowWidth > 375" field="ammountOfDrunkenCups" sortable :header="windowWidth > 900 ? 'Getrunkene Becher' : 'Getru. Becher'"/> -->

            </DataTable>

            <div v-if="windowWidth < 900" class="mvp-explain">
                <div>*Pl. = Platz</div>
                <div>*Trfq. = Trefferquote</div>
                <div>*Trf. = Treffer</div>
                <div>*Spi. = Spiele</div>
                <!-- <div v-if="windowWidth > 375">*Getru. Becher = Getrunkene Becher</div> -->
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, PropType } from "vue"
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Avatar from '@/components/shared/Avatar.vue';
import { getMVPList } from "@/util/tournamentPlayerFunctions";

let props = defineProps({
   tournament: {type: Object as PropType<Tournament>, required: true }
});

let windowWidth = ref(window.screen.width);
window.addEventListener("resize", () => {
    windowWidth.value = window.screen.width;
});

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

    if(index === 0) return '!bg-[var(--secondary-color-weak)] mvp-rank-1';
    if(index === 1) return '!bg-[#e6faff] mvp-rank-2';
    if(index === 2) return '!bg-[#f4fdff] mvp-rank-3';

    return '';
}
</script>

<style scoped>
:deep(.mvp-sticky-header) {
    position: sticky;
    top: 202px;
    z-index: 2;
}

/* Zeilen sind klickbar und öffnen das Spielerprofil */
.MVP-Table :deep(.p-datatable-tbody > tr) {
    cursor: pointer;
}
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

/* Sortier-Pfeil nur an der aktiv sortierten Spalte anzeigen */
.MVP-Table :deep(.p-datatable-sort-icon){
    display: none;
}
.MVP-Table :deep([data-p-sorted="true"] .p-datatable-sort-icon){
    display: inline-block;
}

/*MOBILE*/
@media (width <= 900px){
    .mvp-explain{
        font-size: 14px;
        color: var(--main-color);
        margin-bottom: 30px;
    }
    .MVP-Table :deep(tr.mvp-rank-1 > td){ font-size: 15px; }
    .MVP-Table :deep(tr.mvp-rank-2 > td){ font-size: 14px; }
    .MVP-Table :deep(tr.mvp-rank-3 > td){ font-size: 14px; }
    .MVP-Table :deep(.mvp-avatar){ width: 22px !important; height: 22px !important; }
}
</style>