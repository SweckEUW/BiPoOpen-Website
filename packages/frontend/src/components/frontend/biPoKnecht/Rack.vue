<template>
  <div class="Rack" :style="{ 'transform': isTeam1 ? 'rotate(0deg)' : 'rotate(180deg)'}">

    <div v-show="isActiveTeam" class="ra-middle">
      <div style="width: 100%; text-align: center;">{{ infoText }}</div>
      <div class="ra-buttons">
        <div class="ra-button" @click="setModifier('bouncer')" :style="{ 
          'background': modifier == 'bouncer' ? '#6e1a22' : (isTeam1 ? 'var(--main-color)' : 'var(--secondary-color)')
          }"
        >
          Bouncer
        </div>
        <div class="ra-button" @click="setModifier('trickshot')" :style="{ 
          'background': modifier == 'trickshot' ? '#6e1a22' : (isTeam1 ? 'var(--main-color)' : 'var(--secondary-color)')
          }"
        >
          Trickshot
        </div>
      </div>
      <div class="ra-button" v-if="reRackAvailable" @click="performReRack()">Re-Rack</div>
    </div>

    <!-- Nullwurf -->
    <div v-show="!isActiveTeam" class="ra-null" :id="`ra-null-team-${isTeam1 ? '0' : '1'}`"
      @click="performTurn('miss',{})"
      :style="{ 'outlineColor': isTeam1 ? 'var(--main-color)' : 'var(--secondary-color)', 'color': isTeam1 ? 'var(--main-color)' : 'var(--secondary-color)'}"
    >
      Nullwurf
    </div>

    <!-- Cups -->
    <div class="ra-cups" :style="{ opacity: isActiveTeam ? '0.3' : '1', pointerEvents: isActiveTeam ? 'none' : 'auto'}">
      <div v-for="rowIndex in 4" :key="rowIndex" class="ra-cups-row">
        <div v-for="circleIndex in rowIndex" @click="performTurn('hit', { cupIndex: getCupIndex(rowIndex, circleIndex) })" class="ra-cups-cup" 
          :id="`ra-cup-team-${isTeam1 ? '0' : '1'}-${getCupIndex(rowIndex, circleIndex)}`"
          :style="{ 
            'background': getCupColor(rowIndex, circleIndex), 
            'pointer-events': cupsHit.includes(getCupIndex(rowIndex, circleIndex)) ? 'none' : 'auto',
            'width': isActiveTeam ? '13dvw' : '20dvw',
            'height': isActiveTeam ? '13dvw' : '20dvw'
          }"
        />
      </div>
    </div>

    <!-- Airball -->
    <div v-show="!isActiveTeam" class="ra-airball" :id="`ra-airball-team-${isTeam1 ? '0' : '1'}`"
      @click="performTurn('airball',{})"
      :style="{ 'outlineColor': isTeam1 ? 'var(--main-color)' : 'var(--secondary-color)', 'color': isTeam1 ? 'var(--main-color)' : 'var(--secondary-color)'}"
    >
      Airball
    </div>

    <div :id="`ra-ball-team-${isTeam1 ? '0' : '1'}-0`" class="ra-ball"/>
    <div :id="`ra-ball-team-${isTeam1 ? '0' : '1'}-1`" class="ra-ball"/>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue';

const props = defineProps({
  isTeam1: { type: Boolean, required: true },
  infoText: { type: String, required: true },
  activeTeamIndex: { type: Number, required: true },
  activeTeam: { type: Object as PropType<Team>, required: true },
  activePlayer: { type: Object as PropType<Player>, required: true },
  activePlayerIndex: { type: Number, required: true },
  cupsHit: { type: Array as PropType<number[]>, required: true },
  cupsHitEnemyTeam: { type: Array as PropType<number[]>, required: true },
  switchActivePlayer: { type: Function as PropType<(teamIndex?:number, playerIndex?:number) => void>, required: true },
  turns: { type: Array as PropType<Turn[]>, required: true },
  modifier: { type: null as unknown as PropType<'bouncer' | 'trickshot' | undefined>, required: true },
  setModifier: { type: Function as PropType<(newModifier:'bouncer' | 'trickshot' | undefined) => void>, required: true },
  setInfoText: { type: Function as PropType<(newInfoText:string) => void>, required: true },
  setModalGameOverVisible: { type: Function as PropType<(isVisible:boolean) => void>, required: true }
});

let performedReRacks = 0;
let tmpTurnHits:number[] = [];

let getCupIndex = (row:number, cupIndex:number) => {
  const zeroBasedRow = row - 1;
  const zeroBasedIndex = cupIndex - 1;
  let index = (zeroBasedRow * (zeroBasedRow + 1)) / 2 + zeroBasedIndex;
  return index; 
}

let performTurn = async (turnType:Turn['type'], turnData:Turn['data']) => {
  let ball = getBallHtmlElement(props.activeTeamIndex == 0 ? 1 : 0, props.activePlayerIndex);
  ball.style.opacity = '1';

  if(turnType == 'miss'){
    console.log("Miss");
    moveBallToArea(ball, `ra-null-team-${props.activeTeamIndex == 0 ? 1 : 0}`);
  }

  if(turnType == 'airball'){
    console.log("Airball");
    moveBallToArea(ball, `ra-airball-team-${props.activeTeamIndex == 0 ? 1 : 0}`);
  }

  if(turnType == 'hit'){
    console.log("Hit");
    tmpTurnHits.push((turnData as HitTurn).cupIndex);
    moveBallToCup(ball, (turnData as HitTurn).cupIndex);
  }

  if(props.modifier == 'bouncer' && turnType == 'hit'){
    console.log("Bouncer");
    props.setInfoText(props.activePlayer.name + " bitte den zweiten Becher vom Bouncer auswählen!");
    props.setModifier(undefined);
    
    turnType = 'bouncer';
    turnData = {
      cupIndex1: (turnData as HitTurn).cupIndex,
      cupIndex2: await performCupSelection()
    } satisfies BouncerTurn;

    // Mark secont Hit
    tmpTurnHits.push((turnData as BouncerTurn).cupIndex2);
  } 

  if(props.modifier == 'trickshot' && turnType == 'miss'){
    console.log("Trickshot");
    turnType = 'trickshot';

    addTurn(turnType, turnData);

    // Same Player Again for Trickshot
    props.switchActivePlayer(props.activeTeamIndex, props.activePlayerIndex); 
    props.setModifier(undefined);
    props.setInfoText(props.activePlayer.name + " bitte Trickshot eintragen!");
    return
  }

  // handle bomb & balls back
  let lastTurn = props.turns[props.turns.length - 1];
  if(props.activePlayerIndex != 0 && (lastTurn.type == 'bouncer' || lastTurn.type == 'hit') && (turnType == 'hit' || turnType == 'bouncer')){
    let lastTurnHitCupIndex = lastTurn.type == 'hit' ? (lastTurn.data as HitTurn).cupIndex : (lastTurn.data as BouncerTurn).cupIndex1;
    let thisTurnHitCupIndex = turnType == 'hit' ? (turnData as HitTurn).cupIndex : (turnData as BouncerTurn).cupIndex1;
    if(lastTurnHitCupIndex == thisTurnHitCupIndex){
      console.log("Bomb");

      props.setInfoText(props.activePlayer.name + " bitte den zweiten Becher der Bombe auswählen!");
      let selectedCup1 = await performCupSelection();

      props.setInfoText(props.activePlayer.name + " bitte den dritten Becher der Bombe auswählen!");
      let selectedCup2 = await performCupSelection();
      
      turnType = 'bomb';
      turnData = {
        cupIndex1: (turnData as HitTurn).cupIndex,
        cupIndex2: selectedCup1,
        cupIndex3: selectedCup2
      } satisfies BombTurn;

      tmpTurnHits.push(selectedCup1, selectedCup2);
    }else{
      console.log("balls back");

      turnType = 'ballsback';
      turnData = {
        cupIndex1: (turnData as HitTurn).cupIndex
      } satisfies BallsBackTurn;
    }

    moveTmpTurnHitsToCupsHit();
    hideBalls();
    addTurn(turnType, turnData);
    props.switchActivePlayer(props.activeTeamIndex, 0); // Balls Back - New Turn

    return;
  }

  if(props.cupsHit.length + tmpTurnHits.length == 10 && lastTurn.type != 'lastCup'){
    console.log("lastCup");

    turnType = 'lastCup';
    turnData = {
      cupIndex: (turnData as HitTurn).cupIndex
    } satisfies LastCupTurn;
  }

  // End Game after Gentlemans rule
  let lastCupTurn = props.turns.find(turn => turn.type == 'lastCup');
  if(lastCupTurn && lastCupTurn.teamIndex != props.activeTeamIndex && props.activePlayerIndex == 1)
    props.setModalGameOverVisible(true);
  

  // Moved tmpTurnHits into main cupsHit array. tmpTurnHits needed so users can hit the same cup in one turn
  moveTmpTurnHitsToCupsHit();
  hideBalls();
  addTurn(turnType, turnData);
  props.switchActivePlayer();

  props.setModifier(undefined);
}

// computed property if the activeteamindex matches with is team1
let isActiveTeam = computed(() => {
  if(props.isTeam1)
    return props.activeTeamIndex === 0;
  return props.activeTeamIndex === 1;
});

let getCupColor = (row:number, cupIndex:number) => {
  let cupIndexValue = getCupIndex(row, cupIndex);
  if(props.cupsHit.includes(cupIndexValue))
    return "gray";
  return props.isTeam1 ? 'var(--main-color)' : 'var(--secondary-color)';
}

let moveBallToCup = (ball:HTMLElement, cupIndex:number) => {
  const cupElement = getCupHTMLElement(cupIndex);
  ball.style.top = `${cupElement.offsetTop + 25}px`; // TODO: make the ball centered. +25px is just guessed
  ball.style.left = `${cupElement.offsetLeft + 25}px`;
}

let moveBallToArea = (ball:HTMLElement, areaName:string) => {
  let areaElement = document.getElementById(areaName)!;
  props.isTeam1 ? ball.style.top = `${areaElement.offsetTop}px` : ball.style.bottom = `${areaElement.getBoundingClientRect().top}px`;
  ball.style.left = `calc(50% - 15px)`;
}

let getCupHTMLElement = (index:number) => {
  return document.getElementById(`ra-cup-team-${props.activeTeamIndex == 0 ? 1 : 0}-${index}`)!;
}
let getBallHtmlElement = (teamIndex:number, index:number) => {
  return document.getElementById(`ra-ball-team-${teamIndex}-${index}`)!;
}

// Check if the team can re-rack
let reRackAvailable = computed(() => {
  // Ignore if last turn was bomb or balls back 
  let lastTurn = props.turns[props.turns.length - 1];
  if(lastTurn && (lastTurn.type == 'bomb' || lastTurn.type == 'ballsback'))
    return false;

  // Only 2 Re-Racks allowed
  if(performedReRacks == 2)
    return false;

  // You can only Re-Rack before the first player did a turn
  if(props.activePlayerIndex == 1)
    return false;

  // Dont Allow Re-Racks on already Re-Racked positions
  if(props.cupsHitEnemyTeam.length == 4 && [6,7,8,9].every(v => props.cupsHitEnemyTeam.includes(v)))
    return false;
  if(props.cupsHitEnemyTeam.length == 6 && [3,5,6,7,8,9].every(v => props.cupsHitEnemyTeam.includes(v)))
    return false;
  if(props.cupsHitEnemyTeam.length == 7 && [3,4,5,6,7,8,9].every(v => props.cupsHitEnemyTeam.includes(v)))
    return false;

  return props.cupsHitEnemyTeam.length == 4 || props.cupsHitEnemyTeam.length == 6 || props.cupsHitEnemyTeam.length == 7;
});

// Set cups Hit array into a re-rack position
let performReRack = () => {
  let cupsHit = props.cupsHitEnemyTeam.length;
  
  while (props.cupsHitEnemyTeam.length > 0) // Clear Array 
    props.cupsHitEnemyTeam.pop();

  if(cupsHit == 4)
    props.cupsHitEnemyTeam.push(6,7,8,9); // Re-Rack to 6 Cups
  if(cupsHit == 6)
    props.cupsHitEnemyTeam.push(3,5,6,7,8,9); // Re-Rack to 4 Cups
  if(cupsHit == 7)
    props.cupsHitEnemyTeam.push(3,4,5,6,7,8,9); // Re-Rack to 3 Cups

  performedReRacks++;
}

let performCupSelection: () => Promise<number> = () => {
  return new Promise((resolve) => {
    const teamIndex = props.activeTeamIndex === 0 ? 1 : 0;

    // Alle Cup-Elemente sammeln
    const cups = Array.from({ length: 10 }, (_, i) =>
      document.getElementById(`ra-cup-team-${teamIndex}-${i}`)!
    );

    // Listener-Funktionen hier ablegen, damit wir sie wieder entfernen können
    const handlers: ((e: MouseEvent) => void)[] = [];

    // Diese Funktion wird bei einem Klick aufgerufen
    const handleClick = (cupIndex: number, e: MouseEvent) => {
      e.stopPropagation(); // Klick nicht weiterleiten
      e.preventDefault();  // Standardaktion verhindern

      // Alle Listener wieder entfernen
      cups.forEach((cup, i) => {
        cup.removeEventListener("click", handlers[i], true);
      });

      // Promise auflösen
      resolve(cupIndex);
    };

    // Listener für jeden Cup anlegen
    cups.forEach((cup, i) => {
      const listener = (e: MouseEvent) => handleClick(i, e);
      handlers[i] = listener;
      cup.addEventListener("click", listener, true); // true = Capture-Phase
    });
  });
}

let hideBalls = () => {
  if(props.activePlayerIndex != 0){
    for(let i = 0; i < 2; i++){
      let ball = getBallHtmlElement(props.activeTeamIndex == 0 ? 1 : 0, i);
      ball.style.opacity = '0';
    }
  }
}

let moveTmpTurnHitsToCupsHit = () => {
  if(props.activePlayerIndex != 0){
    tmpTurnHits = [...new Set(tmpTurnHits)]; // Remove duplicates in case of Bomb
    props.cupsHit.push(...tmpTurnHits);
    tmpTurnHits = [];
  }
}

let addTurn = (turnType:Turn['type'], turnData:Turn['data']) => {
  props.turns.push({
    playerIndex: props.activePlayerIndex,
    teamIndex: props.activeTeamIndex,
    type: turnType,
    data: turnData,
    time: new Date().getTime()
  });
}
</script>

<style scoped>
.Rack{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.ra-middle{
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
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
  width: 30px;
  opacity: 0;
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
  height: 60px;
  outline: 2px solid;
  font-weight: bold;
}
.ra-airball{
  margin-top: 10px;
}
.ra-null{
  margin-bottom: 10px;
}

.ra-buttons{
  display: flex;
  width: 100%;
  justify-content: center;
}
.ra-button{
  padding: 15px 25px;
  cursor: pointer;
  margin: 5px;
  width: 120px;
  text-align: center;
  color: white;
  background-color: var(--main-color);
}
</style>