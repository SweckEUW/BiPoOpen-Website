<template>
  <div class="Rack" :style="{ 'transform': isTeam1 ? 'rotate(0deg)' : 'rotate(180deg)', 'height': isActiveTeam ? '30%' : '70%' }">

    <div v-show="isActiveTeam" class="ra-middle">
      <div class="ra-infotext">
        <span>{{ infoText }}</span>
        <span v-if="currentPlayerHeat == 2" class="ra-heat-badge">🔥 Heaten Up!</span>
        <span v-if="currentPlayerHeat >= 3" class="ra-heat-badge ra-heat-badge--fire">🔥🔥🔥 ON FIRE!</span>
      </div>
      <div class="ra-buttons">
        <div class="ra-button" @click="setModifier('bouncer')" :style="{ 
          'background': modifier == 'bouncer' ? '#6e1a22' : (isTeam1 ? 'var(--main-color)' : 'var(--secondary-color)')
          }"
        >
          Bouncer
        </div>
        <div class="ra-button" @click="performDirectTrickshot()" :style="{ 
          'background': isTeam1 ? 'var(--main-color)' : 'var(--secondary-color)'
          }"
        >
          Trickshot!
        </div>
      </div>
      <div class="ra-buttons">
        <div class="ra-button ra-button--danger" v-if="cupsHitEnemyTeam.length > 0 && !isSelectingCup" @click="performDeathCup()">☠️ Deathcup</div>
        <div class="ra-button ra-button--undo" v-if="!isSelectingCup && hasUndoHistory" @click="undoLastTurn()">↩ Rückgängig</div>
      </div>
      <div class="ra-button ra-button--rerack" v-if="reRackAvailable && !isSelectingCup" @click="performReRack()" >Re-Rack ({{ 2 - performedReRacks }} übrig)</div>
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
            'width': isActiveTeam ? '13dvw' : '17dvw',
            'height': isActiveTeam ? '13dvw' : '17dvw'
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
import { computed, PropType, ref } from 'vue';

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
  setModalGameOverVisible: { type: Function as PropType<(isVisible:boolean) => void>, required: true },
  // New props
  gamePhase: { type: String as PropType<GamePhase>, required: true },
  playerHeatMap: { type: Object as PropType<Record<string, number>>, required: true },
  updatePlayerHeat: { type: Function as PropType<(teamIndex: number, playerIndex: number, hit: boolean) => void>, required: true },
  performedReRacks: { type: Number, required: true },
  onIncrementReRacks: { type: Function as PropType<() => void>, required: true },
  undoLastTurn: { type: Function as PropType<() => void>, required: true },
  saveState: { type: Function as PropType<() => void>, required: true },
  triggerOvertime: { type: Function as PropType<(startingTeamIndex: number) => void>, required: true },
  hasUndoHistory: { type: Boolean, required: true },
});

let isSelectingCup = ref(false);
// tmpTurnHits accumulates cup hits from player 0 AND player 1 within a single round.
// It is NOT reset between player 0 and player 1's throws intentionally, to enable bomb detection.
// It is cleared by moveTmpTurnHitsToCupsHit() at the end of player 1's throw.
let tmpTurnHits: number[] = [];

let currentPlayerHeat = computed(() => {
  const key = `${props.activeTeamIndex}-${props.activePlayerIndex}`;
  return props.playerHeatMap[key] || 0;
});

let getCupIndex = (row:number, cupIndex:number) => {
  const zeroBasedRow = row - 1;
  const zeroBasedIndex = cupIndex - 1;
  return (zeroBasedRow * (zeroBasedRow + 1)) / 2 + zeroBasedIndex;
}

// Determine if we are currently in Gentleman's Rule phase by inspecting the turns array.
// GM rule: the DEFENDING team throws after the ATTACKING team hit their last cup AND completed their round.
let computeIsGMPhase = (): boolean => {
  const turns = props.turns;

  // Find the most recent overtimeStart index (so we only look at lastCup turns after it)
  let overtimeStartIdx = -1;
  for (let i = turns.length - 1; i >= 0; i--) {
    if (turns[i].type === 'overtimeStart') { overtimeStartIdx = i; break; }
  }

  // Find the most recent lastCup turn after the most recent overtimeStart
  let lastCupTurn: Turn | undefined;
  let lastCupIdx = -1;
  for (let i = turns.length - 1; i >= 0; i--) {
    if (turns[i].type === 'lastCup' && i > overtimeStartIdx) {
      lastCupTurn = turns[i]; lastCupIdx = i; break;
    }
  }

  if (!lastCupTurn) return false;

  // Defending team (not the attacker who hit lastCup) must be active
  if (lastCupTurn.teamIndex === props.activeTeamIndex) return false;

  // The attacking team must have COMPLETED their round (player 1 threw)
  if (lastCupTurn.playerIndex === 1) return true; // lastCup was by player 1 → round complete

  // Check if player 1 of the attacking team threw after lastCup
  for (let i = lastCupIdx + 1; i < turns.length; i++) {
    if (turns[i].teamIndex === lastCupTurn.teamIndex && turns[i].playerIndex === 1) return true;
  }

  return false;
}

let getLastCupTurn = (): Turn | undefined => {
  for (let i = props.turns.length - 1; i >= 0; i--) {
    if (props.turns[i].type === 'lastCup') return props.turns[i];
  }
  return undefined;
}

let performTurn = async (turnType:Turn['type'], turnData:Turn['data']) => {
  // Save state for undo BEFORE any changes
  props.saveState();

  let ball = getBallHtmlElement(props.activeTeamIndex == 0 ? 1 : 0, props.activePlayerIndex);
  ball.style.opacity = '1';

  if(turnType == 'miss'){
    moveBallToArea(ball, `ra-null-team-${props.activeTeamIndex == 0 ? 1 : 0}`);
  }
  if(turnType == 'airball'){
    moveBallToArea(ball, `ra-airball-team-${props.activeTeamIndex == 0 ? 1 : 0}`);
  }
  if(turnType == 'hit'){
    tmpTurnHits.push((turnData as HitTurn).cupIndex);
    moveBallToCup(ball, (turnData as HitTurn).cupIndex);
  }

  // --- BOUNCER MODIFIER ---
  if(props.modifier == 'bouncer' && turnType == 'hit'){
    props.setInfoText(props.activePlayer.name + " bitte den zweiten Becher vom Bouncer auswählen!");
    props.setModifier(undefined);
    isSelectingCup.value = true;
    const cupIndex2 = await performCupSelection();
    isSelectingCup.value = false;
    turnType = 'bouncer';
    turnData = { cupIndex1: (turnData as HitTurn).cupIndex, cupIndex2 } satisfies BouncerTurn;
    tmpTurnHits.push(cupIndex2);
  }

  // --- GENTLEMAN'S RULE CHECK ---
  const isGMPhase = computeIsGMPhase();

  if(isGMPhase) {
    // ===== GENTLEMAN'S RULE MODE =====
    if(turnType == 'miss' || turnType == 'airball') {
      // Miss during GM rule
      props.updatePlayerHeat(props.activeTeamIndex, props.activePlayerIndex, false);
      tmpTurnHits = [];
      hideBallsForce();
      addTurn(turnType, turnData);
      if(props.activePlayerIndex === 0) {
        // Player 0 missed → player 1 takes over
        props.switchActivePlayer(props.activeTeamIndex, 1);
        props.setInfoText(props.activePlayer.name + " ist am Zug (Gentleman's Rule)!");
      } else {
        // Player 1 also missed → attacking team wins (game over)
        props.setModalGameOverVisible(true);
      }
      props.setModifier(undefined);
      return;
    }

    if(turnType == 'hit' || turnType == 'bouncer') {
      const hitsToAdd = [...new Set(tmpTurnHits)].filter(ci => !props.cupsHit.includes(ci));

      // Check if all enemy cups will be cleared
      if(props.cupsHit.length + hitsToAdd.length >= 10) {
        // All cups cleared during GM rule → Overtime!
        for(const ci of hitsToAdd) props.cupsHit.push(ci);
        tmpTurnHits = [];
        hideBallsForce();
        props.updatePlayerHeat(props.activeTeamIndex, props.activePlayerIndex, true);
        addTurn(turnType, turnData);
        addTurn('overtimeStart', {} as OvertimeStartTurn);
        // The attacking team (who originally hit lastCup) starts overtime
        const lastCupT = getLastCupTurn();
        const startingTeam = lastCupT ? lastCupT.teamIndex : props.activeTeamIndex;
        props.triggerOvertime(startingTeam);
        props.setModifier(undefined);
        return;
      }

      // Hit during GM rule → same player continues (throw until miss)
      for(const ci of hitsToAdd) props.cupsHit.push(ci);
      tmpTurnHits = [];
      hideBallsForce();
      props.updatePlayerHeat(props.activeTeamIndex, props.activePlayerIndex, true);
      addTurn(turnType, turnData);
      props.switchActivePlayer(props.activeTeamIndex, props.activePlayerIndex); // same player
      const heat = props.playerHeatMap[`${props.activeTeamIndex}-${props.activePlayerIndex}`] || 0;
      if(heat >= 3) props.setInfoText(props.activePlayer.name + " ist ON FIRE! 🔥🔥🔥 (Gentleman's Rule)");
      else props.setInfoText(props.activePlayer.name + " weiter werfen (Gentleman's Rule)!");
      props.setModifier(undefined);
      return;
    }
  }

  // ===== NORMAL PLAY =====

  // --- BOMB & BALLS BACK (only for player 1's throw, same team) ---
  let lastTurn = props.turns[props.turns.length - 1];
  if(props.activePlayerIndex != 0 && lastTurn &&
     (lastTurn.type == 'bouncer' || lastTurn.type == 'hit') &&
     lastTurn.teamIndex === props.activeTeamIndex &&
     (turnType == 'hit' || turnType == 'bouncer')){

    let lastCupIndex = lastTurn.type == 'hit' ? (lastTurn.data as HitTurn).cupIndex : (lastTurn.data as BouncerTurn).cupIndex1;
    let thisCupIndex = turnType == 'hit' ? (turnData as HitTurn).cupIndex : (turnData as BouncerTurn).cupIndex1;

    if(lastCupIndex == thisCupIndex){
      // BOMB!
      props.setInfoText(props.activePlayer.name + " bitte den zweiten Becher der Bombe auswählen!");
      isSelectingCup.value = true;
      let cup2 = await performCupSelection();
      props.setInfoText(props.activePlayer.name + " bitte den dritten Becher der Bombe auswählen!");
      let cup3 = await performCupSelection();
      isSelectingCup.value = false;
      turnType = 'bomb';
      turnData = { cupIndex1: thisCupIndex, cupIndex2: cup2, cupIndex3: cup3 } satisfies BombTurn;
      tmpTurnHits.push(cup2, cup3);
      props.updatePlayerHeat(props.activeTeamIndex, 0, true);
      props.updatePlayerHeat(props.activeTeamIndex, props.activePlayerIndex, true);
      moveTmpTurnHitsToCupsHit();
      hideBalls();
      addTurn(turnType, turnData);
      // Check if bomb cleared all cups (direct win, no GM rule per rules)
      if(props.cupsHit.length >= 10) {
        props.setModalGameOverVisible(true);
        return;
      }
      props.switchActivePlayer(props.activeTeamIndex, 0); // Balls Back
      props.setModifier(undefined);
      return;
    } else {
      // BALLS BACK
      props.updatePlayerHeat(props.activeTeamIndex, 0, true);
      props.updatePlayerHeat(props.activeTeamIndex, props.activePlayerIndex, true);
      turnType = 'ballsback';
      turnData = { cupIndex1: thisCupIndex } satisfies BallsBackTurn;
      moveTmpTurnHitsToCupsHit();
      hideBalls();
      addTurn(turnType, turnData);
      // Check if balls-back cleared all cups (direct win)
      if(props.cupsHit.length >= 10) {
        props.setModalGameOverVisible(true);
        return;
      }
      props.switchActivePlayer(props.activeTeamIndex, 0); // Balls Back
      props.setModifier(undefined);
      return;
    }
  }

  // --- UPDATE HEAT ---
  if(turnType == 'miss' || turnType == 'airball') {
    props.updatePlayerHeat(props.activeTeamIndex, props.activePlayerIndex, false);
  }
  if(turnType == 'hit' || turnType == 'bouncer') {
    props.updatePlayerHeat(props.activeTeamIndex, props.activePlayerIndex, true);
  }

  // --- LAST CUP CHECK ---
  if((turnType == 'hit' || turnType == 'bouncer') &&
     props.cupsHit.length + [...new Set(tmpTurnHits)].filter(ci => !props.cupsHit.includes(ci)).length >= 10 &&
     lastTurn?.type != 'lastCup') {
    const hitCupIndex = turnType == 'bouncer' ? (turnData as BouncerTurn).cupIndex1 : (turnData as HitTurn).cupIndex;
    turnType = 'lastCup';
    turnData = { cupIndex: hitCupIndex } satisfies LastCupTurn;
  }

  // --- ON-FIRE CHECK (not for lastCup turns) ---
  const heatKey = `${props.activeTeamIndex}-${props.activePlayerIndex}`;
  const currentHeat = props.playerHeatMap[heatKey] || 0;
  if(currentHeat >= 3 && (turnType == 'hit' || turnType == 'bouncer' || turnType == 'onfire')) {
    // Player is on fire! Convert hit → onfire
    if(turnType == 'hit') {
      turnType = 'onfire';
      turnData = { cupIndex: (turnData as HitTurn).cupIndex } satisfies OnFireTurn;
    }
    moveTmpTurnHitsToCupsHit();
    hideBalls();
    addTurn(turnType, turnData);
    // Same player throws again
    props.switchActivePlayer(props.activeTeamIndex, props.activePlayerIndex);
    props.setInfoText(props.activePlayer.name + " ist ON FIRE! 🔥🔥🔥");
    props.setModifier(undefined);
    return;
  }

  // Heat announcements
  if((turnType == 'hit' || turnType == 'bouncer') && currentHeat === 2) {
    props.setInfoText(props.activePlayer.name + " - Heaten Up! 🔥 (sag 'Heaten Up!')");
  }

  // --- COMMIT TURN ---
  moveTmpTurnHitsToCupsHit();
  hideBalls();
  addTurn(turnType, turnData);
  props.switchActivePlayer();
  props.setModifier(undefined);
}

// Direct trickshot: one click registers the trickshot and same player throws again
let performDirectTrickshot = () => {
  props.saveState();
  addTurn('trickshot', {} as TrickshotTurn);
  props.switchActivePlayer(props.activeTeamIndex, props.activePlayerIndex);
  props.setInfoText(props.activePlayer.name + " bitte Trickshot werfen!");
  tmpTurnHits = [];
}

// Deathcup: active team's player threw ball into an already-hit enemy cup
let performDeathCup = () => {
  props.saveState();
  const remainingCups = 10 - props.cupsHitEnemyTeam.length;
  for(let i = 0; i < 10; i++) {
    if(!props.cupsHitEnemyTeam.includes(i)) props.cupsHitEnemyTeam.push(i);
  }
  addTurn('deathcup', { remainingCups } satisfies DeathcupTurn);
  props.setModalGameOverVisible(true);
}

let isActiveTeam = computed(() => {
  if(props.isTeam1) return props.activeTeamIndex === 0;
  return props.activeTeamIndex === 1;
});

let getCupColor = (row:number, cupIndex:number) => {
  let cupIndexValue = getCupIndex(row, cupIndex);
  if(props.cupsHit.includes(cupIndexValue)) return "gray";
  return props.isTeam1 ? 'var(--main-color)' : 'var(--secondary-color)';
}

let moveBallToCup = (ball:HTMLElement, cupIndex:number) => {
  const cupElement = getCupHTMLElement(cupIndex);
  ball.style.top = `${cupElement.offsetTop + 25}px`;
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

// Re-Rack availability (reactive since performedReRacks is now a prop)
let reRackAvailable = computed(() => {
  let lastTurn = props.turns[props.turns.length - 1];
  if(lastTurn && (lastTurn.type == 'bomb' || lastTurn.type == 'ballsback')) return false;
  if(props.performedReRacks >= 2) return false;
  if(props.activePlayerIndex == 1) return false;
  // Not in GM rule
  if(computeIsGMPhase()) return false;

  // Don't re-rack already re-racked positions
  if(props.cupsHitEnemyTeam.length == 4 && [6,7,8,9].every(v => props.cupsHitEnemyTeam.includes(v))) return false;
  if(props.cupsHitEnemyTeam.length == 6 && [3,5,6,7,8,9].every(v => props.cupsHitEnemyTeam.includes(v))) return false;
  if(props.cupsHitEnemyTeam.length == 7 && [3,4,5,6,7,8,9].every(v => props.cupsHitEnemyTeam.includes(v))) return false;

  return props.cupsHitEnemyTeam.length == 4 || props.cupsHitEnemyTeam.length == 6 || props.cupsHitEnemyTeam.length == 7;
});

let performReRack = () => {
  props.saveState();
  let cupsHit = props.cupsHitEnemyTeam.length;
  while(props.cupsHitEnemyTeam.length > 0) props.cupsHitEnemyTeam.pop();
  if(cupsHit == 4) props.cupsHitEnemyTeam.push(6,7,8,9);
  if(cupsHit == 6) props.cupsHitEnemyTeam.push(3,5,6,7,8,9);
  if(cupsHit == 7) props.cupsHitEnemyTeam.push(3,4,5,6,7,8,9);
  props.onIncrementReRacks();
  addTurn('rerack', {} as ReRackTurn);
}

// Cup selection for bomb/bouncer — skips already-hit and pending-hit cups
let performCupSelection: () => Promise<number> = () => {
  return new Promise((resolve) => {
    const teamIndex = props.activeTeamIndex === 0 ? 1 : 0;
    const cups = Array.from({ length: 10 }, (_, i) =>
      document.getElementById(`ra-cup-team-${teamIndex}-${i}`)!
    );
    const handlers: ((e: MouseEvent) => void)[] = [];
    const handleClick = (cupIndex: number, e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      cups.forEach((cup, i) => cup.removeEventListener("click", handlers[i], true));
      resolve(cupIndex);
    };
    cups.forEach((cup, i) => {
      // Skip cups already hit or pending in this turn
      if(props.cupsHit.includes(i) || tmpTurnHits.includes(i)) return;
      const listener = (e: MouseEvent) => handleClick(i, e);
      handlers[i] = listener;
      cup.addEventListener("click", listener, true);
    });
  });
}

let hideBalls = () => {
  if(props.activePlayerIndex != 0){
    for(let i = 0; i < 2; i++){
      let ball = getBallHtmlElement(props.activeTeamIndex == 0 ? 1 : 0, i);
      ball.style.opacity = '0'; ball.style.top = 'auto'; ball.style.bottom = 'auto';
      ball.style.left = 'auto'; ball.style.right = 'auto';
    }
  }
}

let hideBallsForce = () => {
  for(let i = 0; i < 2; i++){
    let ball = getBallHtmlElement(props.activeTeamIndex == 0 ? 1 : 0, i);
    ball.style.opacity = '0'; ball.style.top = 'auto'; ball.style.bottom = 'auto';
    ball.style.left = 'auto'; ball.style.right = 'auto';
  }
}

let moveTmpTurnHitsToCupsHit = () => {
  if(props.activePlayerIndex != 0){
    tmpTurnHits = [...new Set(tmpTurnHits)];
    props.cupsHit.push(...tmpTurnHits.filter(ci => !props.cupsHit.includes(ci)));
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
  height: 50%;
}

.ra-middle{
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  z-index: 10;
  position: relative;
}

.ra-infotext{
  width: 100%;
  text-align: center;
  margin-bottom: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.ra-heat-badge{
  font-size: 12px;
  font-weight: bold;
  color: #ff6600;
  background: #fff3cd;
  border-radius: 8px;
  padding: 2px 8px;
}

.ra-heat-badge--fire{
  color: white;
  background: #cc3300;
  animation: pulse 0.8s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
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
  height: 30px;
  opacity: 0;
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
  flex-wrap: wrap;
}
.ra-button{
  padding: 10px 20px;
  cursor: pointer;
  margin: 3px;
  min-width: 100px;
  text-align: center;
  color: white;
  background-color: var(--main-color);
  font-size: 14px;
  border-radius: 4px;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.ra-button--danger{
  background-color: #8B0000 !important;
}
.ra-button--undo{
  background-color: #555 !important;
}
.ra-button--rerack{
  background-color: var(--main-color);
}
</style>
