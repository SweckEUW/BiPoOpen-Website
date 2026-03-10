<template>
    <div class="BiPoKnecht">
        <ModalGameOver v-if="modalGameOverVisible" :match="match" :isLeagueGame="props.isLeagueGame" />
        <ModalStartingPlayer v-if="modalStartingPlayerVisible" :match="match" :startGame="startGame"/>

        <div class="bik-game" v-if="!modalStartingPlayerVisible">
            <Rack v-for="i in 2" :key="i"
                :isTeam1="i != 1" :infoText="infoText" :activeTeamIndex="activeTeamIndex" :activeTeam="activeTeam" :activePlayer="activePlayer" :turns="turns" :modifier="modifier" :setModifier="setModifier" :setModalGameOverVisible="setModalGameOverVisible"
                :activePlayerIndex="activePlayerIndex" :cupsHit="i == 1 ? cupsHitTeam2 : cupsHitTeam1" :cupsHitEnemyTeam="i == 1 ? cupsHitTeam1 : cupsHitTeam2" :switchActivePlayer="switchActivePlayer" :setInfoText="setInfoText"
                :gamePhase="gamePhase"
                :playerHeatMap="playerHeatMap" :updatePlayerHeat="updatePlayerHeat"
                :performedReRacks="i == 1 ? performedReRacks2 : performedReRacks1"
                :onIncrementReRacks="i == 1 ? incrementReRacks2 : incrementReRacks1"
                :undoLastTurn="undoLastTurn" :saveState="saveState"
                :triggerOvertime="triggerOvertime"
                :hasUndoHistory="stateHistory.length > 0"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, PropType, ref, watch } from 'vue';
import Rack from '@/components/frontend/biPoKnecht/Rack.vue';
import ModalGameOver from './ModalGameOver.vue';
import ModalStartingPlayer from './ModalStartingPlayer.vue';

const props = defineProps({
    match: {type: Object as PropType<Match>, required: true },
    isLeagueGame: {type: Boolean, required: false, default: false }
});

let infoText = ref("Bob ist am Zug!");
let modalGameOverVisible= ref(false);
let modalStartingPlayerVisible= ref(true);

let match = ref(props.match);

let turns = ref<Turn[]>([]);
let activeTeamIndex = ref(0); // 0 für Team 1, 1 für Team 2
let activePlayerIndex = ref(0); // Index des aktiven Spielers im Team
let modifier = ref<'bouncer' | 'trickshot' | undefined>(undefined);

let cupsHitTeam1 = ref<number[]>([]); // Array to store hit cups
let cupsHitTeam2 = ref<number[]>([]); // Array to store hit cups

// Extended state
let gamePhase = ref<GamePhase>('normal');
let playerHeatMap = ref<Record<string, number>>({});
let performedReRacks1 = ref(0);
let performedReRacks2 = ref(0);
let stateHistory = ref<GameState[]>([]);

let activeTeam = computed(() => {
    return activeTeamIndex.value === 0 ? match.value.team1 : match.value.team2;
});

let activePlayer = computed(() => {
    return activeTeam.value.players[activePlayerIndex.value];
});

let startGame = (startTeamIndex:number) => {
    modalStartingPlayerVisible.value = false;
    activeTeamIndex.value = startTeamIndex;
    infoText.value = activeTeam.value.players[activePlayerIndex.value].name + " ist am Zug!";
    if(process.env.NODE_ENV != 'development')
        document.documentElement.requestFullscreen();
    match.value.time = new Date().getTime();
}

let switchActivePlayer = (teamIndex?:number, playerIndex?:number) => {
    let nextActivePlayerIndex = playerIndex != undefined ? playerIndex : activePlayerIndex.value + 1;

    if (nextActivePlayerIndex > activeTeam.value.players.length - 1) {
        nextActivePlayerIndex = 0;
        let nextActiveTeamIndex = activeTeamIndex.value == 1 ? 0 : 1;
        activeTeamIndex.value = nextActiveTeamIndex;
    }

    if(teamIndex != undefined)
        activeTeamIndex.value = teamIndex;

    activePlayerIndex.value = nextActivePlayerIndex;
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

let updatePlayerHeat = (teamIndex: number, playerIndex: number, hit: boolean) => {
  const key = `${teamIndex}-${playerIndex}`;
  if (hit) {
    playerHeatMap.value[key] = (playerHeatMap.value[key] || 0) + 1;
  } else {
    playerHeatMap.value[key] = 0;
  }
}

let incrementReRacks1 = () => { performedReRacks1.value++; }
let incrementReRacks2 = () => { performedReRacks2.value++; }

let saveState = () => {
  stateHistory.value.push({
    cupsHitTeam1: [...cupsHitTeam1.value],
    cupsHitTeam2: [...cupsHitTeam2.value],
    activeTeamIndex: activeTeamIndex.value,
    activePlayerIndex: activePlayerIndex.value,
    turnsCount: turns.value.length,
    performedReRacks1: performedReRacks1.value,
    performedReRacks2: performedReRacks2.value,
    playerHeatMap: { ...playerHeatMap.value },
    gamePhase: gamePhase.value,
    modifier: modifier.value,
    infoText: infoText.value,
  });
}

let undoLastTurn = () => {
  if (stateHistory.value.length === 0) return;
  const prevState = stateHistory.value.pop()!;
  cupsHitTeam1.value = prevState.cupsHitTeam1;
  cupsHitTeam2.value = prevState.cupsHitTeam2;
  activeTeamIndex.value = prevState.activeTeamIndex;
  activePlayerIndex.value = prevState.activePlayerIndex;
  turns.value.splice(prevState.turnsCount);
  performedReRacks1.value = prevState.performedReRacks1;
  performedReRacks2.value = prevState.performedReRacks2;
  playerHeatMap.value = prevState.playerHeatMap;
  gamePhase.value = prevState.gamePhase;
  modifier.value = prevState.modifier;
  infoText.value = prevState.infoText;
}

let triggerOvertime = (startingTeamIndex: number) => {
  cupsHitTeam1.value = [3, 4, 5, 6, 7, 8, 9];
  cupsHitTeam2.value = [3, 4, 5, 6, 7, 8, 9];
  performedReRacks1.value = 0;
  performedReRacks2.value = 0;
  playerHeatMap.value = {};
  gamePhase.value = 'overtime';
  activeTeamIndex.value = startingTeamIndex;
  activePlayerIndex.value = 0;
  infoText.value = (startingTeamIndex === 0 ? match.value.team1 : match.value.team2).players[0].name + " ist am Zug! (Verlängerung)";
}

// Watch modalGameOverVisible
watch(modalGameOverVisible, () => {
  if(modalGameOverVisible.value){
    document.exitFullscreen();
    
    match.value.turns = turns.value;

    // Calculate player scores from turns
    match.value.turns.forEach((turn, index) => {
        let player = getPlayer(match.value, turn.teamIndex, turn.playerIndex);

        if(turn.type == 'bouncer')
            player.score += 2;

        if(turn.type == 'lastCup')
            player.score += 1;

        if(turn.type == 'onfire')
            player.score += 1;

        if(turn.type == 'bomb')
            player.score += 1.5;

        if(turn.type == 'ballsback')
            player.score += 1;

        if(turn.type == 'deathcup')
            player.score += (turn.data as DeathcupTurn).remainingCups;

        if(turn.type == 'hit'){
            if(turn.playerIndex == 0 && index + 1 < match.value.turns!.length && match.value.turns![index+1].type == 'bomb')
                player.score += 1.5;
            else
                player.score += 1;
        }
    });

    // If its a 1v1, remove the duplicate player
    if(match.value.team1.players[0].name == match.value.team1.players[1].name){
        match.value.turns.forEach((turn) => {
            if(turn.teamIndex == 0)
                turn.playerIndex = 0;
        });
        match.value.team1.players[0].score += match.value.team1.players[1].score;
        match.value.team1.players = [match.value.team1.players[0]];
    }

    if(match.value.team2.players[0].name == match.value.team2.players[1].name){
        match.value.turns.forEach((turn) => {
            if(turn.teamIndex == 1)
                turn.playerIndex = 0;
        });
        match.value.team2.players[0].score += match.value.team2.players[1].score;
        match.value.team2.players = [match.value.team2.players[0]];
    }

    match.value.endTime = new Date().getTime();
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