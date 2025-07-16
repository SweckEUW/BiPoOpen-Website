<template>
    <div class="BiPoKnecht">
        <ModalEnterTeam v-if="modalVisible" :startGame="startGame"/>

        <div v-if="!modalVisible" class="bik-game">
            <Rack :isTeam1="false" :infoText="infoText" :activeTeamIndex="activeTeamIndex" :activeTeam="activeTeam" :activePlayer="activePlayer" :performTurn="performTurn" :activePlayerIndex="activePlayerIndex"/>
            <Rack :isTeam1="true" :infoText="infoText" :activeTeamIndex="activeTeamIndex" :activeTeam="activeTeam" :activePlayer="activePlayer" :performTurn="performTurn" :activePlayerIndex="activePlayerIndex"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Rack from '@/components/frontend/biPoKnecht/Rack.vue';
import ModalEnterTeam from './ModalEnterTeam.vue';

let infoText = ref("Spieler 1 von Team 1 ist am Zug!");
let modalVisible= ref(false);
let teams = ref({
    team1: {
        players: ["Spieler 1", "Spieler 2"]
    },
    team2: {
        players: ["Spieler 1", "Spieler 2"]
    }
});

let turns = [];

let activeTeam = computed(() => {
    return activeTeamIndex.value === 0 ? teams.value.team1 : teams.value.team2;
});
let activePlayer = computed(() => {
    return activeTeam.value.players[activePlayerIndex.value];
});

let startGame = (teams:any) => {
    teams.value = teams; // Teams speichern
    modalVisible.value = false; // Modal schließen
    infoText.value = activeTeam.value.players[activePlayerIndex.value] + " ist am Zug!";
}

let activeTeamIndex = ref(0); // 0 für Team 1, 1 für Team 2
let activePlayerIndex = ref(0); // Index des aktiven Spielers im Team

let performTurn = (cupIndex:number|null) => {
    turns.push({
        team: activeTeam.value,
        player: activePlayer.value,
        cupIndex: cupIndex
    });

    switchActivePlayer();
}

let switchActivePlayer = () => {
    let nextActivePlayerIndex = activePlayerIndex.value + 1;

    if (nextActivePlayerIndex > activeTeam.value.players.length - 1) {
        nextActivePlayerIndex = 0;

        // Switch to the next team
        let nextActiveTeamIndex = activeTeamIndex.value == 1 ? 0 : 1;
        activeTeamIndex.value = nextActiveTeamIndex;
    }

    activePlayerIndex.value = nextActivePlayerIndex;

    // Aktualisiere den Info-Text
    infoText.value = activeTeam.value.players[activePlayerIndex.value] + " ist am Zug!";
}
</script>

<style scoped>
.BiPoKnecht{
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0%;
    left: 0%;
    z-index: 1000;
    background-color: white;
}
.bik-game{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

</style>