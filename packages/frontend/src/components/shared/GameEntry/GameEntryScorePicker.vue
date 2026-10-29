<template>
    <div class="GameEntryScorePicker" :class="{ 'gs-disabled': disabled }" role="radiogroup" :aria-label="label">
        <button v-if="page > 0" type="button" class="gs-cell gs-nav" :disabled="disabled" aria-label="Weniger Treffer" @click="page--">
            <i class="pi pi-chevron-left"></i>
        </button>

        <button v-for="score in pageScores" :key="score"
            type="button"
            role="radio"
            class="gs-cell"
            :class="{ 'gs-selected': score === modelValue }"
            :aria-checked="score === modelValue"
            :disabled="disabled"
            @click="emit('update:modelValue', score)"
        >{{ score }}</button>

        <button v-if="hasNextPage" type="button" class="gs-cell gs-nav" :disabled="disabled" aria-label="Mehr Treffer" @click="page++">
            <i class="pi pi-plus"></i>
        </button>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

// 11 Werte pro Seite + ein Pfeil: 0-10 [+], [<] 11-21 ...
const PAGE_SIZE = 11;

const props = withDefaults(defineProps<{
    modelValue: number | null;
    max?: number;
    disabled?: boolean;
    label?: string;
}>(), {
    max: 21,
    label: 'Treffer',
});

const emit = defineEmits<{ 'update:modelValue': [value: number] }>();

// Vorbelegte hohe Werte (Bearbeiten) direkt auf ihrer Seite oeffnen.
const page = ref(Math.floor((props.modelValue ?? 0) / PAGE_SIZE));

const pageScores = computed(() => {
    const start = page.value * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE - 1, props.max);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
});

const hasNextPage = computed(() => (page.value + 1) * PAGE_SIZE <= props.max);
</script>

<style scoped>
.GameEntryScorePicker{
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 4px;
}
.gs-cell{
    display: flex;
    align-items: center;
    justify-content: center;
    height: 34px;
    padding: 0;
    border: 1px solid #E3E5E9;
    border-radius: 8px;
    background: white;
    color: #1F2328;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background .15s ease, color .15s ease, border-color .15s ease;
}
.gs-cell:hover:not(:disabled){
    background: #F4F5F7;
}
.gs-cell:focus-visible{
    outline: 2px solid var(--main-color);
    outline-offset: 1px;
}
.gs-nav{
    background: #F4F5F7;
    color: #555B63;
}
.gs-nav .pi{
    font-size: 11px;
}
.gs-selected,
.gs-selected:hover:not(:disabled){
    background: #1F2328;
    border-color: #1F2328;
    color: white;
}
.gs-disabled .gs-cell{
    color: #B5B9C0;
    border-color: #EEF0F2;
    cursor: default;
}

/* MOBILE S */
@media (max-width: 360px){
    .GameEntryScorePicker{
        gap: 2px;
    }
    .gs-cell{
        font-size: 12px;
        border-radius: 6px;
    }
}
</style>
