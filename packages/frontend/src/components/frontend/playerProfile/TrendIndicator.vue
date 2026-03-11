<template>
    <div v-if="value !== null && value !== undefined" class="flex items-center justify-center gap-[4px] mt-[6px]">
        <span class="material-icons" :class="colorClass" style="font-size: 1.2rem">{{ iconName }}</span>
        <Tag :severity="severity" :value="formattedValue" rounded />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Tag from 'primevue/tag';

const props = withDefaults(defineProps<{
    value: number | null;
    suffix?: string;
}>(), {
    suffix: '',
});

const iconName = computed(() => {
    if (props.value === null || props.value === undefined) return '';
    if (props.value > 0) return 'trending_up';
    if (props.value < 0) return 'trending_down';
    return 'trending_flat';
});

const colorClass = computed(() => {
    if (props.value === null || props.value === undefined) return '';
    if (props.value > 0) return 'text-green-500';
    if (props.value < 0) return 'text-red-500';
    return 'text-[--p-text-muted-color]';
});

const severity = computed((): 'success' | 'danger' | 'secondary' => {
    if (props.value === null || props.value === undefined) return 'secondary';
    if (props.value > 0) return 'success';
    if (props.value < 0) return 'danger';
    return 'secondary';
});

const formattedValue = computed(() => {
    if (props.value === null || props.value === undefined) return '';
    let prefix = props.value > 0 ? '+' : '';
    return prefix + props.value + props.suffix;
});
</script>
