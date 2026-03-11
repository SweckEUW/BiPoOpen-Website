<template>
    <Card>
        <template #content>
            <div class="flex items-center gap-[10px]">
                <Avatar :label="name.charAt(0)" shape="circle" />
                <div class="flex-1">
                    <span v-if="clickable" class="font-bold text-[14px] text-[--p-primary-color] cursor-pointer hover:underline" @click="$emit('open', name)">{{ name }}</span>
                    <div v-else class="font-bold text-[14px] break-words">{{ name }}</div>
                    <div class="text-[12px] text-[--p-text-muted-color]">{{ matches }} Spiele{{ subtitle ? ' ' + subtitle : '' }}</div>
                </div>
                <div class="flex gap-[4px]">
                    <Tag severity="success" :value="wins + 'S'" rounded />
                    <Tag severity="danger" :value="losses + 'N'" rounded />
                </div>
            </div>
        </template>
    </Card>
</template>

<script setup lang="ts">
import Avatar from 'primevue/avatar';
import Tag from 'primevue/tag';
import Card from 'primevue/card';

defineProps<{
    name: string;
    matches: number;
    wins: number;
    losses: number;
    clickable?: boolean;
    subtitle?: string;
}>();

defineEmits<{
    open: [name: string];
}>();
</script>
