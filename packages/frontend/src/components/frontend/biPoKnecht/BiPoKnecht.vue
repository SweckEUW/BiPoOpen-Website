<template>
    <div class="absolute w-[100dvw] h-[100dvh] top-0 left-0 z-[1000] bg-white">
        <ModalGameOver v-if="game.modalGameOverVisible" :match="match" :isLeagueGame="props.isLeagueGame" />
        <ModalStartingPlayer v-if="game.modalStartingPlayerVisible" :match="match" :startGame="game.startGame"/>

        <div class="w-full h-full flex flex-col justify-between" v-if="!game.modalStartingPlayerVisible">
            <Rack v-for="i in 2" :key="i" :game="game" :teamIndex="i - 1" />
        </div>

        <!-- Fixed bottom nav -->
        <div v-if="!game.modalStartingPlayerVisible"
            class="fixed bottom-[5px] left-1/2 -translate-x-1/2 w-auto bg-white rounded-t-2xl px-4 pt-4 pb-3 shadow-sm flex flex-row gap-2 items-center justify-center"
        >
            <Button @click="game.undoLastTurn()" :disabled="game.turns.length === 0" text rounded>
                <i class="pi pi-undo text-2xl text-gray-600" />
            </Button>
            <Button text rounded>
                <i class="pi pi-clock text-2xl text-gray-600" />
            </Button>
            <Button text rounded>
                <i class="pi pi-trophy text-2xl text-gray-600" />
            </Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { PropType, ref, watch } from 'vue';
import Button from 'primevue/button';
import Rack from '@/components/frontend/biPoKnecht/Rack.vue';
import ModalGameOver from './ModalGameOver.vue';
import ModalStartingPlayer from './ModalStartingPlayer.vue';
import { useBiPoKnecht } from './useBiPoKnecht';
import { createEffects } from './biPoKnechtDom';

const props = defineProps({
    match: {type: Object as PropType<Match>, required: true },
    isLeagueGame: {type: Boolean, required: false, default: false }
});

const match = ref(props.match);

const effects = createEffects();
const game = useBiPoKnecht(match, effects);

// When the game ends, write the final scores into the match and leave fullscreen.
watch(() => game.modalGameOverVisible, (visible) => {
    if (visible) {
        game.finalizeScores();
        effects.exitFullscreen();
    }
});
</script>
