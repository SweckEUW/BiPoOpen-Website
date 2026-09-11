<template>
    <AutoComplete
        :modelValue="modelValue"
        @update:modelValue="$emit('update:modelValue', $event)"
        :suggestions="suggestions"
        @complete="onSearch"
        @show="scrollSuggestionsToBottom"
        @item-select="$emit('item-select', $event)"
        @focus="loadNames"
        :placeholder="placeholder"
        :class="className"
        overlayClass="bipo-player-autocomplete-panel"
        appendTo="self"
        :dropdown="false"
        v-bind="$attrs"
        class="p-0"
        inputClass="!p-[5px]"
    >
        <template #option="{ option }">
            <div class="flex items-center gap-[8px]">
                <Avatar :name="option" size="normal" shape="circle" />
                <span>{{ option }}</span>
            </div>
        </template>
    </AutoComplete>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue';
import AutoComplete from 'primevue/autocomplete';
import Avatar from '@/components/shared/Avatar.vue';
import { getAllPlayerNames, getPlayerMatchCounts } from '@/components/frontend/playerProfile/PlayerProfileUtilFunctions';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
    modelValue?: string;
    placeholder?: string;
    className?: string;
    maxResults?: number;
}>(), {
    modelValue: '',
    placeholder: 'Spieler suchen...',
    className: '',
    maxResults: 15,
});

defineEmits<{
    'update:modelValue': [value: string];
    'item-select': [event: { value: string }];
}>();

let names: string[] = [];
let matchCounts: Record<string, number> = {};
let namesLoaded = false;
let namesLoading = false;
const suggestions = ref<string[]>([]);

const scrollSuggestionsToBottom = async () => {
    await nextTick();
    const panel = document.querySelector<HTMLElement>('.bipo-player-autocomplete-panel');
    const scrollContainer = panel?.querySelector<HTMLElement>('.p-autocomplete-list-container')
        ?? panel?.querySelector<HTMLElement>('.p-autocomplete-list');
    if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
};

const loadNames = async () => {
    if (namesLoaded || namesLoading) return;
    namesLoading = true;
    names = await getAllPlayerNames();
    matchCounts = await getPlayerMatchCounts();
    namesLoading = false;
    namesLoaded = true;
};

const onSearch = async (event: { query: string }) => {
    const query = event.query.trim().toLowerCase();
    if (!query) {
        suggestions.value = [];
        return;
    }
    if (!namesLoaded) await loadNames();
    suggestions.value = names
        .filter(n => n.toLowerCase().includes(query))
        .sort((firstName, secondName) => {
            const matchDifference = (matchCounts[secondName] ?? 0) - (matchCounts[firstName] ?? 0);
            return matchDifference || firstName.localeCompare(secondName, 'de', { sensitivity: 'base' });
        })
        .slice(0, props.maxResults)
        .reverse();
    await scrollSuggestionsToBottom();
};
</script>

<style scoped>
:deep(.bipo-player-autocomplete-panel) {
    top: auto !important;
    bottom: calc(100% + 8px) !important;
}
</style>
