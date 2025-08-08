<template>
  <div class="Rack" :style="{ 'transform': isTeam1 ? 'rotate(0deg)' : 'rotate(180deg)'}">
    <div v-show="isActiveTeam" class="ra-middle">
      <div style="width: 100%; text-align: center;">{{ infoText }}</div>
      <div class="ra-buttons">
        <div :style="{ 'background': isTeam1 ? 'var(--main-color)' : 'var(--secondary-color)'}">Bouncer</div>
        <div :style="{ 'background': isTeam1 ? 'var(--main-color)' : 'var(--secondary-color)'}">Trickshot</div>
      </div>
    </div>

    <!-- Nullwurf -->
    <div v-show="!isActiveTeam" class="ra-null" :style="{ 'outlineColor': isTeam1 ? 'var(--main-color)' : 'var(--secondary-color)', 'color': isTeam1 ? 'var(--main-color)' : 'var(--secondary-color)'}">
      Nullwurf
    </div>

    <!-- Cups -->
    <div class="ra-cups" :style="{ opacity: isActiveTeam ? '0.3' : '1', pointerEvents: isActiveTeam ? 'none' : 'auto'}">
      <div v-for="rowIndex in 4" :key="rowIndex" class="ra-cups-row">
        <div v-for="circleIndex in rowIndex" @click="selectCup(rowIndex, circleIndex)" class="ra-cups-cup" 
          :style="{ 
            'background': getCupColor(rowIndex, circleIndex), 
            'width': isActiveTeam ? '13dvw' : '20dvw',
            'height': isActiveTeam ? '13dvw' : '20dvw'
          }"
        />
      </div>
    </div>

    <!-- Airball -->
    <div v-show="!isActiveTeam" class="ra-airball" :style="{ 'outlineColor': isTeam1 ? 'var(--main-color)' : 'var(--secondary-color)', 'color': isTeam1 ? 'var(--main-color)' : 'var(--secondary-color)'}">
      Airball
    </div>

    <div class="ra-ball"/>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

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

let getCupColor = (row:number, cupIndex:number) => {
  let cupIndexValue = getCupIndex(row, cupIndex);
  if(cupsHit.value.includes(cupIndexValue))
    return "gray";
  return props.isTeam1 ? 'var(--main-color)' : 'var(--secondary-color)';
}
</script>

<style scoped>
.Rack{
  height: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.ra-cups{
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}
.ra-cups-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5%;
}
.ra-cups-cup {
  aspect-ratio: 1; 
  border-radius: 50%;
  position: relative;
}
.ra-ball{
  width: 20px;
  aspect-ratio: 1;
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  background-color: white;
  border: 1px solid black;
}

.ra-airball, .ra-null{
  margin: 5px;
  width: calc(100% - 10px);
  display: flex;
  justify-content: center;
  align-items: center;
  transform: rotate(180deg);
  height: 100px;
  outline: 2px solid;
  font-weight: bold;
}

.ra-buttons{
  display: flex;
  width: 100%;
  justify-content: center;
}
.ra-buttons div{
  padding: 15px 25px;
  cursor: pointer;
  margin: 5px;
  width: 120px;
  text-align: center;
  color: white;
  background-color: var(--main-color);
}
</style>