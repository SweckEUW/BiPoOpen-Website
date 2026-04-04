<template>
    <AutoComplete
        :modelValue="modelValue"
        @update:modelValue="$emit('update:modelValue', $event)"
        :suggestions="suggestions"
        @complete="onSearch"
        @item-select="$emit('item-select', $event)"
        @focus="loadNames"
        :placeholder="placeholder"
        :class="className"
        appendTo="self"
        :dropdown="false"
        v-bind="$attrs"
    >
        <template #option="{ option }">
            <div class="flex items-center gap-[8px]">
                <PlayerProfileAvatar :name="option" size="normal" shape="circle" />
                <span>{{ option }}</span>
            </div>
        </template>
    </AutoComplete>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AutoComplete from 'primevue/autocomplete';
import PlayerProfileAvatar from '@/components/frontend/playerProfile/PlayerProfileAvatar.vue';
import { getAllPlayerNames } from '@/components/frontend/playerProfile/PlayerProfileUtilFunctions';

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
let namesLoaded = false;
let namesLoading = false;
const suggestions = ref<string[]>([]);

const loadNames = async () => {
    if (namesLoaded || namesLoading) return;
    namesLoading = true;
    names = await getAllPlayerNames();
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
        .slice(0, props.maxResults);
};
</script>
