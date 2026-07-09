<template>
    <PrimeAvatar
        :label="avatarImageComputed ? undefined : playerInitials"
        :image="avatarImageComputed || undefined"
        :shape="shape"
        :pt="{
            root: {
                class: `${avatarImageComputed ? '!bg-transparent' : (grayscale ? '!bg-gray-300 !text-gray-700' : '!bg-[var(--main-color)] opacity-70 !text-[white]')}`
            },
            image: {
                class: `${shape === 'square' ? 'object-contain' : 'object-cover'} bg-transparent ${grayscale ? 'grayscale' : ''}`
            }
        }"
    />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import PrimeAvatar from 'primevue/avatar';
import { getPlayerInitials, getPlayerProfileImage, fetchPlayerProfileImage, backendImageCache } from '@/components/frontend/playerProfile/PlayerProfileImageMapping';

const props = defineProps({
    name: {type: String, required: true},
    avatarImage: {type: String, required: false},
    shape: {type: String as () => 'circle' | 'square', default: 'circle'},
    grayscale: {type: Boolean, default: false},
});

// Trigger backend fetch on mount (result lands in reactive cache)
onMounted(() => {
    fetchPlayerProfileImage(props.name);
});

const avatarImageComputed = computed(() => {
    if(props.avatarImage)
        return props.avatarImage;

    // Access backendImageCache reactively to re-render when image is fetched
    const _trigger = backendImageCache[props.name?.trim().replace(/\s+/g, ' ').toLowerCase()];
    return getPlayerProfileImage(props.name);
});
const playerInitials = computed(() => getPlayerInitials(props.name));
const grayscale = computed(() => props.grayscale);
</script>
