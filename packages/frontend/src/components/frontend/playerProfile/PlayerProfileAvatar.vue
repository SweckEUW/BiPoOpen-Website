<template>
    <Avatar
        :label="avatarImage ? undefined : playerInitials"
        :image="avatarImage || undefined"
        :size="size"
        :shape="shape"
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
}>(), {
    size: 'normal',
    shape: 'circle',
});

const avatarImage = computed(() => getPlayerProfileImage(props.name));
const playerInitials = computed(() => getPlayerInitials(props.name));
</script>

<style scoped>
:deep(.p-avatar img) {
    object-fit: contain;
}
</style>
