<script setup lang="ts">
import { PropType, ref } from 'vue';
import { OpenGame } from './OpenGamesTypes';

const props = defineProps({
    openGame: {type: Object as PropType<OpenGame>, required: true }
});

let date = new Date(props.openGame.time);
let time = date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

let team1Score = props.openGame.team1.players.reduce((acc, player) => acc + player.score, 0);
let team2Score = props.openGame.team2.players.reduce((acc, player) => acc + player.score, 0);
let teamLoose = ref(team1Score < team2Score);
</script>

<template> 
    <div class="OpenGameMatchElement">
        <div class="ogm-time">{{ date.toLocaleDateString("de-DE") + "  -  " + time + " Uhr"}}</div>

        <div class="ogm-game">
            <div class="ogm-game-team" v-for="team,i in [openGame.team1, openGame.team2]">
                <div class="ogm-game-team-player" v-for="player in team.players" :class="{ 'teamLoose': i == 0 && teamLoose || i == 1 && !teamLoose }">
                    <div class="ogm-game-team-player-name">{{ player.name }}</div>
                    <div class="ogm-game-team-player-score">{{ player.score }}</div>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
.OpenGameMatchElement{
    margin-top: 20px;
    margin-bottom: 30px;
    width: 100%;
}
.ogm-time{
    font-size: 20px;
    margin-bottom: 5px;
    color: var(--main-color);
}

.ogm-game{
    margin-bottom: 10px;
    border-radius: 4px;
    width: 100%;
    padding: 10px 15px;
    border: 1px solid black;
}

.ogm-game-team-player{
    display: flex;
}
.ogm-game-team-player-name{
    width: 100%;
    color: var(--secondary-color);
    font-size: 18px;
    font-weight: 700;
    align-self: flex-start;
}
.ogm-game-team-player-score{
    background-color: var(--secondary-color);
    padding: 5px;
    color: #fff;
    width: 35px;
    text-align: center;
}

.ogm-game-team:first-of-type .ogm-game-team-player-score{
    background-color: var(--main-color);
}
.ogm-game-team:first-of-type .ogm-game-team-player-name{
    color: var(--main-color);
    align-self: flex-end;
}

.teamLoose .ogm-game-team-player-score{
    background-color: var(--loose-gray) !important;
}
.teamLoose .ogm-game-team-player-name{
    color: var(--loose-gray) !important;
}
</style>