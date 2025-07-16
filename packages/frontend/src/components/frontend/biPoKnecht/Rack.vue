<template>
  <div class="Rack" :style="{ 'transform': isTeam1 ? 'rotate(0deg)' : 'rotate(180deg)', opacity: isActiveTeam ? '1' : '0.3'}">
    <div class="ra-container">
      <!-- Info Text -->
      <div class="ra-info">{{ infoText }}</div>

      <!-- Cups -->
      <div class="ra-cups">
        <div v-for="rowIndex in 4" :key="rowIndex" class="ra-cups-row">
          <div v-for="circleIndex in rowIndex" @click="selectCup(rowIndex, circleIndex)" class="ra-cups-cup" 
            :style="{ 
              'background': getCupColor(rowIndex, circleIndex), 
              // 'height': isActiveTeam ? '70px' : '30px',
            }"
          >
            <div v-if="isBallVisible(rowIndex, circleIndex)" class="ra-cups-ball" :style="{ left: isBomb ? '10%' : '', top: isBomb ? '10%' : ''}"/>
            <div v-if="isBomb && getCupIndex(rowIndex, circleIndex) == activeThrow" class="ra-cups-ball" style="left: 40%; top: 40%;" />
          </div>
        </div>
      </div>

      <!-- Confirm Button -->
      <div v-if="isActiveTeam" @click="makeTurn()" class="ra-button" :style="{ 'background': isTeam1 ? 'var(--main-color)' : 'var(--secondary-color)'}">
        {{ buttonText }}
      </div>

      <!-- Modifier Menue -->
      <ModifierMenue v-if="isActiveTeam"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import ModifierMenue from '@/components/frontend/biPoKnecht/ModifierMenue.vue';

const props = defineProps({
  isTeam1: { type: Boolean, required: true },
  infoText: { type: String, required: true },
  activeTeamIndex: { type: Number, required: true },
  activeTeam: { type: Object, required: true },
  activePlayer: { type: String, required: true },
  performTurn: { type: Function, required: true },
  activePlayerIndex: { type: Number, required: true }
});

let cupsHit = ref<number[]>([]); // Array to store hit cups
let playerThrows = ref<(null|number)[]>([null,null]);

let activeThrow = computed(() => {
  return playerThrows.value[props.activePlayerIndex];
});

let getCupIndex = (row:number, cupIndex:number) => {
  const zeroBasedRow = row - 1;
  const zeroBasedIndex = cupIndex - 1;
  let index = (zeroBasedRow * (zeroBasedRow + 1)) / 2 + zeroBasedIndex;
  return index; 
}

let selectCup = (row:number, cupIndex:number) => {
  let index = getCupIndex(row, cupIndex);

  if(cupsHit.value.includes(index))
    return;

  if(index === activeThrow.value) {
    playerThrows.value[props.activePlayerIndex] = null;
    return;
  }

  playerThrows.value[props.activePlayerIndex] = index;
}

// computed property if the activeteamindex matches with is team1
let isActiveTeam = computed(() => {
  if(props.isTeam1)
    return props.activeTeamIndex === 0;
  
  return props.activeTeamIndex === 1;
});

let makeTurn = () => {
  // Clear Board and store hits
  if(props.activePlayerIndex == props.activeTeam.players.length - 1) {
    playerThrows.value.forEach((_, index) => {
      if(playerThrows.value[index] != null)
        cupsHit.value.push(playerThrows.value[index]);
      playerThrows.value[index] = null; 
    });
  }

  props.performTurn(activeThrow.value);
}

let buttonText = computed(() => {
  let text = "Nullwurf eintragen";
  if(activeThrow.value != null)
    text = "Treffer eintragen";

  // Check if in the playersthrow array are only the same numbers
  if(isBomb.value)
    text = "Bombe eintragen";

  return props.activePlayer + " " + text;
});

let getCupColor = (row:number, cupIndex:number) => {
  let cupIndexValue = getCupIndex(row, cupIndex);
  if(cupsHit.value.includes(cupIndexValue))
    return "gray";
  return props.isTeam1 ? 'var(--main-color)' : 'var(--secondary-color)';
}

let isBallVisible = (row:number, cupIndex:number) => {
  let cupIndexValue = getCupIndex(row, cupIndex);
  return playerThrows.value.includes(cupIndexValue);
};

let isBomb = computed(() => {
  return playerThrows.value.every((val) => typeof val === "number" && val === activeThrow.value);
});
</script>

<style scoped>
.Rack{
  display: flex;
  flex-direction: flex-end;
  align-items: center;
}
.ra-container{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.ra-info{
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: black;
}

.ra-cups{
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 30px;
}
.ra-cups-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5%;
}
.ra-cups-cup {
  height: 70px;
  aspect-ratio: 1; 
  border-radius: 50%;
  position: relative;
}
.ra-cups-ball{
  height: 50%;
  aspect-ratio: 1;
  position: absolute;
  border-radius: 50%;
  top: calc(50% - 25%);
  left: calc(50% - 25%);
  pointer-events: none;
  background-color: white;
  border: 1px solid black;
}

.ra-button{
  padding: 10px 20px;
  cursor: pointer;
  margin: 5px;
  color: white;
}
</style>