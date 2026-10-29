<template>
    <!-- Alle Attribute (value, rowClass, sortField, size, @row-click, ...) fallen auf die DataTable durch -->
    <DataTable
        stripedRows
        class="AppTable w-full max-[900px]:text-[14px] max-[360px]:text-[13px]"
        :class="{ 'app-table-clickable': !!attrs.onRowClick }"
        :style="{ '--sticky-top': stickyTop }"
        :pt="{ tableContainer: { class: '!overflow-visible' } }"
    >
        <!-- Platzierung -->
        <Column v-if="rank" :header="labels.rank" :pt="{ headerCell: { class: '!px-1 !w-[26px] !max-w-[26px]' }, bodyCell: { class: '!p-1 !w-[26px] !max-w-[26px]' } }">
            <template #body="{ data, index }">
                {{ (data.placement ?? index) + 1 }}
            </template>
        </Column>

        <slot/>
    </DataTable>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useStickyTop } from './useStickyStack';
import { useTableLabels } from './appTable';

defineProps<{
    rank?: boolean; // Platz-Spalte voranstellen (placement, sonst Zeilenindex)
}>();

const attrs = useAttrs();
const labels = useTableLabels();

// Der Tabellenkopf klebt direkt unter den Sticky-Leisten der umgebenden Komponenten.
const stickyTop = useStickyTop();
</script>

<style scoped>
.AppTable :deep(.p-datatable-thead) {
    position: sticky;
    top: var(--sticky-top);
    z-index: 2;
}

.AppTable :deep(.p-datatable-thead > tr > th) {
    border-width: 0;
    text-align: center;
}

.AppTable :deep(.p-datatable-tbody > tr > td) {
    border-width: 0;
    vertical-align: middle;
}

.app-table-clickable :deep(.p-datatable-tbody > tr) {
    cursor: pointer;
}

/* Sortier-Pfeil nur an der aktiv sortierten Spalte anzeigen */
.AppTable :deep(.p-datatable-sort-icon) {
    display: none;
}
.AppTable :deep([data-p-sorted="true"] .p-datatable-sort-icon) {
    display: inline-block;
}
</style>
