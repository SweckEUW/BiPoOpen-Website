
<template>
    <Modal>
        <template #title>{{ 'Wer soll anfangen?' }}</template>

        <template #template>
            <div>
                <div class="rt-modal-startteam-selector" :style="{ opacity: startTeamIndex === 0 ? 1 : 0.3 }" @click="startTeamIndex = 0">{{ getPlayerNames(match.team1.players) }}</div>
                <div class="rt-modal-startteam-selector" :style="{ opacity: startTeamIndex === 1 ? 1 : 0.3 }" @click="startTeamIndex = 1" style="margin-bottom: 40px;">{{ getPlayerNames(match.team2.players) }}</div>
            </div>
        </template>

        <!-- Button 1 -->
        <template #cancle>
            <div @click = cancel();>Abbrechen</div>
        </template>

        <!-- Button 2 -->   
        <template #confirm>
            <div @click="startGame(startTeamIndex)">Spiel starten</div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { PropType, ref } from "vue"
import Modal from '@/components/shared/Modal.vue';
import router from '@/router.js';

defineProps({
    match: {type: Object as PropType<Match>, required: true },
    startGame: {type: Function as PropType<(startTeamIndex:number) => void>, required: true }
});

let startTeamIndex = ref(0);

const cancel = () => {
    router.go(-1);
}

function getPlayerNames(players:Player[]) {
  const uniqueNames = [...new Set(players.map(p => p.name))];
  return uniqueNames.join(', ');
}
</script>

<style scoped>
.rt-modal-startteam-selector{
    padding: 15px 10px;
    background-color: var(--main-color);
    color: white;
    margin: 10px 0px;
}
</style>