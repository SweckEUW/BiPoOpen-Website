<template>
    <div class="BiPoKnecht">
        <ModalEnterTeam v-if="modalEnterTeamVisible" :setMatch="setMatch"/>
        <BiPoKnecht v-if="match" :match="match"/>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BiPoKnecht from '@/components/frontend/biPoKnecht/BiPoKnecht.vue';
import ModalEnterTeam from './ModalEnterTeam.vue';

// let modalEnterTeamVisible= ref(true);
// let match = ref<Match>();

// Debug
let modalEnterTeamVisible= ref(false);
let match = ref<Match>({
    _id: "123",
    team1: {
        _id: "WASD",
        name: "Team 1",
        players: [
            {_id: "1", name: "Alice", score: 0},
            {_id: "2", name: "Bob", score: 0}
        ]
    },
    team2: {
        _id: "QWER",
        name: "Team 2",
        players: [
            {_id: "3", name: "Charlie", score: 0},
            {_id: "4", name: "David", score: 0}
        ]
    }
}) 

let setMatch = (newMatch: Match) => {
    match.value = newMatch;
    modalEnterTeamVisible.value = false;
}
</script>

<style scoped>
.BiPoKnecht{
    position: absolute;
    width: 100dvw;
    height: 100dvh;
    top: 0%;
    left: 0%;
    z-index: 1000;
    background-color: white;
}
</style>