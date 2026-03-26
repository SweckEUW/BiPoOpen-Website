<template>
    <Avatar
        :label="avatarImage ? undefined : playerInitials"
        :image="avatarImage || undefined"
        :size="size"
        :shape="shape"
        :pt="{
            root: {
                class: `border-2 border-black/10 ${avatarImage ? '' : (grayscale ? '!bg-gray-300 !text-gray-700' : '!bg-[#d8f2f8] !text-[black]')}`
            },
            image: {
                class: `object-contain bg-white ${grayscale ? 'grayscale' : ''}`
            }
        }"
    />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Avatar from 'primevue/avatar';
import { getPlayerInitials, getPlayerProfileImage } from './PlayerProfileImageMapping';

const props = withDefaults(defineProps<{
    name: string;
    size?: 'normal' | 'large' | 'xlarge';
    shape?: 'circle' | 'square';
    grayscale?: boolean;
}>(), {
    size: 'normal',
    shape: 'circle',
    grayscale: false,
});

const avatarImage = computed(() => getPlayerProfileImage(props.name));
const playerInitials = computed(() => getPlayerInitials(props.name));
const grayscale = computed(() => props.grayscale);
</script>
