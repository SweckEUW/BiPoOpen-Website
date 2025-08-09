<script setup lang="ts">
import { onMounted, PropType, ref } from "vue"
import Modal from '@/components/shared/Modal.vue';
import router from '@/router.js';
import { getAllOpenGameNames } from "../openGames/OpenGamesUtilFunctions";

defineProps({
   startGame: {type: Function as PropType<(match:Match, startTeamIndex:number) => void>, required: true }
});

let ammountOfPlayersTeam1 = ref(1);
let ammountOfPlayersTeam2 = ref(1);

let showWhosStartingUI = ref(false);

let openGameNames = ref<string[]>([]);

let match:Match;

let startTeamIndex = ref(0);

onMounted(async () => {
    openGameNames.value = await getAllOpenGameNames();
});

const setMatch = () => {
    match = {
        _id: "",
        team1: {
            _id: "",
            players: []
        },
        team2: {
            _id: "",
            players: []
        },
        time: new Date().getTime()
    }

    for (let i = 1; i < 3; i++) {
        let root = document.getElementById("addOpenGameModal-team-"+i)!;
        let fields = root.getElementsByClassName("rt-modal-team");
        for(let j = 0; j < fields.length; j++){
            let player = (fields[j].getElementsByClassName("rt-modal-input-player")[0] as HTMLInputElement).value.trim();

            let openGamePlayer = {
                _id: "",
                name: player,
                score: 0
            }

            if(i == 1)
                match.team1.players.push(openGamePlayer);
            else
                match.team2.players.push(openGamePlayer);
        }
    }
}

const cancel = () => {
    router.go(-1);
}
</script>

<template>
    <Modal>
        <template #title>{{ showWhosStartingUI ? 'Wer soll anfangen?' : 'Teams eintragen' }}</template>

        <template #template>
            <div class="rt-modal" v-show="!showWhosStartingUI">
                <div v-for="i in 2" :id="'addOpenGameModal-team-' + i" class="rt-modal-container">

                    <div class="rt-modal-team" v-for="index in i == 1 ? ammountOfPlayersTeam1 : ammountOfPlayersTeam2">
                        <input list="bipoKnechtGames" id="openGameNames" class="rt-modal-input-player" :value="'Team' + i + '-Spieler' + index" type="string" :placeholder="'Spieler ' + index" :style="{textAlign: i == 1 ? 'right' : 'left', order: i == 1 ? 1 : 3}">
                        <datalist id="bipoKnechtGames">
                            <option v-for="name in openGameNames" :value="name"/>
                        </datalist>
                    </div>

                    <div class="rt-modal-buttons">
                        <div @click="i == 1 ? ammountOfPlayersTeam1++ : ammountOfPlayersTeam2++">+</div>
                    </div>

                </div>
            </div>

            <div v-if="showWhosStartingUI">
                <div class="rt-modal-startteam-selector" :style="{ opacity: startTeamIndex === 0 ? 1 : 0.3 }" @click="startTeamIndex = 0">{{ match.team1.players.map(player => player.name).join(', ') }}</div>
                <div class="rt-modal-startteam-selector" :style="{ opacity: startTeamIndex === 1 ? 1 : 0.3 }" @click="startTeamIndex = 1" style="margin-bottom: 40px;">{{ match.team2.players.map(player => player.name).join(', ') }}</div>
            </div>
        </template>

        <!-- Button 1 -->
        <template #cancle>
            <div @click = cancel();>Abbrechen</div>
        </template>

        <!-- Button 2 -->   
        <template #confirm>
            <div @click="showWhosStartingUI = true; setMatch()" v-show="!showWhosStartingUI">Weiter</div>
            <div @click="startGame(match, startTeamIndex)" v-show="showWhosStartingUI">Spiel starten</div>
        </template>
    </Modal>
</template>

<style scoped>
.rt-modal{
    overflow: hidden;
}
.rt-modal-score{
    margin: 0px 25px;
    margin-bottom: 15px;
    font-weight: bold;
    font-size: 20px;
}
.rt-modal{
    display: flex;
    justify-content: center;
}
.rt-modal-container{
    width: 100%;
}
.rt-modal-team{
    display: flex; 
}
.rt-modal-input-player{
    text-align: left;   
    width: 250px;
    height: 50px;
    padding: 0px 20px;
    margin: 0px 10px;
    margin-bottom: 10px;
}
.rt-modal-buttons{
    display: flex;
    justify-content: center;
    margin-top: 20px;
    margin-bottom: 30px;
}
.rt-modal-buttons div{
    cursor: pointer;
    background-color: var(--main-color);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin: 0px 15px;
}

.rt-modal-startteam-selector{
    padding: 15px 10px;
    background-color: var(--main-color);
    color: white;
    margin: 10px 0px;
}

/* Remove arrows from input field */
input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  appearance: textfield;
  -moz-appearance: textfield;
}

/*MOBILE*/
@media (width <= 900px){
    .rt-modal-player, .rt-modal-team{
        white-space: break-spaces;
    }

    .rt-modal-input-player{
        width: 100%;
        padding: 0px 4px;
    }
    .rt-modal-input-number{
        width: 40px;
    }
}
</style>
