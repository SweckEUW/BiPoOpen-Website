<template>
    <div>
        <Loadingscreen v-show="registrations === undefined" />

        <div v-if="registrations !== undefined">
            <p v-if="registrations.length === 0" style="text-align: center; color: #888; font-size: 16px; padding: 40px 0;">
                Noch keine Anmeldungen vorhanden.
            </p>

            <div v-if="registrations.length > 0">
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px;">
                    <div
                        v-for="(reg, index) in registrations"
                        :key="String(reg._id)"
                        style="background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.07); padding: 20px; display: flex; align-items: center; gap: 16px;"
                    >
                        <div
                            style="flex-shrink: 0; width: 56px; height: 56px; border-radius: 10px; border: 1px solid #eee; display: flex; align-items: center; justify-content: center; background: #f9f9f9; overflow: hidden;"
                            :style="reg.teamLogo ? 'cursor: pointer;' : ''"
                            @click="reg.teamLogo && openLightbox(reg.teamLogo, reg.teamName)"
                        >
                            <img v-if="reg.teamLogo" :src="reg.teamLogo" :alt="reg.teamName" style="width: 100%; height: 100%; object-fit: contain;" />
                            <span v-else class="material-icons" style="color: #ccc; font-size: 28px;">groups</span>
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                <span style="font-weight: bold; font-size: 15px; color: var(--main-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    #{{ registrations.length - index }} {{ reg.teamName }}
                                </span>
                            </div>
                            <div style="font-size: 13px; color: #555;">{{ reg.player1 }}</div>
                            <div style="font-size: 13px; color: #555;">{{ reg.player2 }}</div>
                            <div v-if="showDates" style="font-size: 11px; color: #aaa; margin-top: 4px;">{{ formatDate(reg.createdAt) }}</div>
                        </div>
                    </div>
                </div>

                <p v-if="showDates" style="margin-top: 20px; color: #888; font-size: 14px; text-align: right;">
                    {{ registrations.length }} {{ registrations.length === 1 ? 'Anmeldung' : 'Anmeldungen' }} gesamt
                </p>
            </div>
        </div>

        <!-- Lightbox -->
        <Teleport to="body">
            <Transition name="lb">
                <div
                    v-if="lightbox"
                    style="position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.82); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;"
                    @click="lightbox = null"
                >
                    <img
                        :src="lightbox.src"
                        :alt="lightbox.name"
                        style="max-width: 90vw; max-height: 80vh; border-radius: 12px; object-fit: contain; box-shadow: 0 8px 40px rgba(0,0,0,0.5);"
                        @click.stop
                    />
                    <p style="color: white; margin-top: 16px; font-size: 16px; font-weight: bold;">{{ lightbox.name }}</p>
                    <span class="material-icons" style="position: absolute; top: 20px; right: 24px; color: white; font-size: 32px; cursor: pointer;">close</span>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import Loadingscreen from '@/components/shared/Loadingscreen.vue';

interface Registration {
    _id: string;
    teamName: string;
    player1: string;
    player2: string;
    teamLogo?: string;
    createdAt: string;
}

defineProps<{ showDates?: boolean }>();

const registrations = ref<Registration[] | undefined>(undefined);
const lightbox = ref<{ src: string; name: string } | null>(null);

const load = async () => {
    try {
        const res = await axios.get('/registrations/get');
        registrations.value = res.data.registrations;
    } catch {
        registrations.value = [];
    }
};
load();

const openLightbox = (src: string, name: string) => {
    lightbox.value = { src, name };
};

const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('de-DE') + ' ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
};
</script>

<style scoped>
.lb-enter-active,
.lb-leave-active {
    transition: opacity 0.2s ease;
}
.lb-enter-from,
.lb-leave-to {
    opacity: 0;
}
</style>
