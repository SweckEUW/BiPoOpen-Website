<script setup lang="ts">
import { addOpenGame } from "./OpenGamesUtilFunctions";
import { ref } from "vue"
import Modal from '@/components/shared/Modal.vue';
import { OpenGame } from "./OpenGamesTypes";

let ammountOfPlayersTeam1 = ref(1);
let ammountOfPlayersTeam2 = ref(1);

const props = defineProps({
    toggleModalAddGame: {type: Function, required: true },
    getOpenGames: {type: Function, required: true },
});

const addGame = async () => {

    let openGame:OpenGame = {
        team1: {
            players: []
        },
        team2: {
            players: []
        },
        time: new Date().getTime()
    }

    for (let i = 1; i < 3; i++) {
        let root = document.getElementById("addOpenGameModal-team-"+i)!;
        let fields = root.getElementsByClassName("rt-modal-team");
        for(let j = 0; j < fields.length; j++){
            let player = (fields[j].getElementsByClassName("rt-modal-input-player")[0] as HTMLInputElement).value;
            let score = parseFloat((fields[j].getElementsByClassName("rt-modal-input-number")[0] as HTMLInputElement).value);

            let openGamePlayer = {
                name: player,
                score: score
            }

            if(i == 1)
                openGame.team1.players.push(openGamePlayer);
            else
                openGame.team2.players.push(openGamePlayer);
        }
    }

    let success = await addOpenGame(openGame);
    if(success){
        await props.getOpenGames();
        props.toggleModalAddGame();
    }
}

</script>

<template>
    <Modal>
        <template #title>Ergebnis eintragen</template>

        <template #template>
            <div class="rt-modal">
                <div v-for="i in 2" :id="'addOpenGameModal-team-' + i" class="rt-modal-container">

                    <!-- TODO: Fix Added Score if more than 1 Player is in each Team -->
                    <!-- <div class="rt-modal-score" :style="{textAlign: i == 1 ? 'right' : 'left'}">{{ 0 }}</div> -->

                    <div class="rt-modal-team" v-for="index in i == 1 ? ammountOfPlayersTeam1 : ammountOfPlayersTeam2">
                        <input class="rt-modal-input-player" type="string" :placeholder="'Spielername'" :style="{textAlign: i == 1 ? 'right' : 'left', order: i == 1 ? 1 : 3}">
                        <input class="rt-modal-input-number" type="number" placeholder="0">
                    </div>

                    <div class="rt-modal-buttons">
                        <div @click="i == 1 ? ammountOfPlayersTeam1++ : ammountOfPlayersTeam2++">+</div>
                    </div>

                </div>
            </div>
        </template>

        <!-- Button 1 -->
        <template #cancle>
            <div @click="toggleModalAddGame();">Abbrechen</div>
        </template>

        <!-- Button 2 -->
        <template #confirm>
            <div @click="addGame()">Eintragen</div>
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
    margin-bottom: 10px;
}
.rt-modal-input-number{
    text-align: center;
    margin: 0px 10px;
    width: 50px;
    height: 50px;
    order: 2;
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

/* Remove arrows from input field */
input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
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
