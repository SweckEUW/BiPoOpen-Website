<template>
    <div class="BiPoKnecht">
        <ModalEnterTeam v-if="modalEnterTeamVisible" :startGame="startGame"/>

        <ModalGameOver v-if="modalGameOverVisible" :match="match"/>

        <div v-if="!modalEnterTeamVisible" class="bik-game">
            <Rack v-for="i in 2"
                :isTeam1="i != 1" :infoText="infoText" :activeTeamIndex="activeTeamIndex" :activeTeam="activeTeam" :activePlayer="activePlayer" :turns="turns" :modifier="modifier" :setModifier="setModifier" :setModalGameOverVisible="setModalGameOverVisible"
                :activePlayerIndex="activePlayerIndex" :cupsHit="i == 1 ? cupsHitTeam2 : cupsHitTeam1" :cupsHitEnemyTeam="i == 1 ? cupsHitTeam1 : cupsHitTeam2" :switchActivePlayer="switchActivePlayer" :setInfoText="setInfoText"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Rack from '@/components/frontend/biPoKnecht/Rack.vue';
import ModalEnterTeam from './ModalEnterTeam.vue';
import ModalGameOver from './ModalGameOver.vue';

let infoText = ref("Bob ist am Zug!");
let modalEnterTeamVisible= ref(true);
let modalGameOverVisible= ref(false);
let match = ref<Match>({
    _id: "placeholder",
    team1: {
        _id: "placeholder",
        players: [
            {_id: "placeholder", name: "", score: 0},
            {_id: "placeholder", name: "", score: 0}
        ]
    },
    team2: {
        _id: "placeholder",
        players: [
            {_id: "placeholder", name: "", score: 0},
            {_id: "placeholder", name: "", score: 0}
        ]
    },
    time: new Date().getTime()
});

let turns = ref<Turn[]>([]);
let activeTeamIndex = ref(0); // 0 für Team 1, 1 für Team 2
let activePlayerIndex = ref(0); // Index des aktiven Spielers im Team
let modifier = ref<'bouncer' | 'trickshot' | undefined>(undefined);

let cupsHitTeam1 = ref<number[]>([]); // Array to store hit cups
let cupsHitTeam2 = ref<number[]>([]); // Array to store hit cups

let activeTeam = computed(() => {
    return activeTeamIndex.value === 0 ? match.value.team1 : match.value.team2;
});

let activePlayer = computed(() => {
    return activeTeam.value.players[activePlayerIndex.value];
});

let startGame = (matchHere:Match, startTeamIndex:number) => {
    match.value = matchHere; // Teams speichern
    modalEnterTeamVisible.value = false; // Modal schließen
    activeTeamIndex.value = startTeamIndex; // Setze das startende Team
    infoText.value = activeTeam.value.players[activePlayerIndex.value].name + " ist am Zug!";
}

let switchActivePlayer = (teamIndex?:number, playerIndex?:number) => {
    let nextActivePlayerIndex = playerIndex != undefined ? playerIndex : activePlayerIndex.value + 1;

    if (nextActivePlayerIndex > activeTeam.value.players.length - 1) {
        nextActivePlayerIndex = 0;

        // Switch to the next team
        let nextActiveTeamIndex = activeTeamIndex.value == 1 ? 0 : 1;
        activeTeamIndex.value = nextActiveTeamIndex;
    }

    if(teamIndex != undefined)
        activeTeamIndex.value = teamIndex;

    activePlayerIndex.value = nextActivePlayerIndex;

    // Aktualisiere den Info-Text
    infoText.value = activeTeam.value.players[activePlayerIndex.value].name + " ist am Zug!";
}

let setModifier = (newModifier:'bouncer' | 'trickshot' | undefined) => {
  if(modifier.value == newModifier)
    modifier.value = undefined;
  else
    modifier.value = newModifier;
}

let setInfoText = (newInfoText:string) => {
  infoText.value = newInfoText;
}

let setModalGameOverVisible = (isVisible:boolean) => {
  modalGameOverVisible.value = isVisible;
}

// Watch modalGameOverVisible
watch(modalGameOverVisible, () => {
  if(modalGameOverVisible.value){
    match.value.turns = turns.value;

    // Calculate player scores from turns
    match.value.turns.forEach((turn, index) => {
        let player = getPlayer(match.value, turn.teamIndex, turn.playerIndex);

        if(turn.type == 'bouncer')
            player.score += 2;

        if(turn.type == 'lastCup')
            player.score += 1;

        if(turn.type == 'bomb')
            player.score += 1.5;

        if(turn.type == 'ballsback')
            player.score += 1;

        if(turn.type == 'hit'){
            if(turn.playerIndex == 0 && match.value.turns![index+1].type == 'bomb') // In case the next throw is a bomb
                player.score += 1.5;
            else
                player.score += 1;
        }
    });
  }
});

let getPlayer = (match:Match, teamIndex: number, playerIndex: number) => {
  const team = teamIndex == 0 ? match.team1 : match.team2;
  const player = team.players[playerIndex];
  return player;
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
.bik-game{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
</style>