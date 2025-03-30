<script setup lang="ts">
import { PropType } from 'vue';
import { Match } from "@/types";

const props = defineProps({
    match: {type: Object as PropType<Match>, required: true },
    playersVisible: {type: Boolean, required: true },
    isTeam2: {type: Boolean, required: true },
});

let team = props.isTeam2 ? props.match.team2 : props.match.team1;
let teamScore:undefined|number = undefined;
let player1Score:undefined|number = undefined;
let player2Score:undefined|number = undefined;
if(props.match.result){
    teamScore = props.match.result.team1Score;
    player1Score = props.match.result.team1Player1Score;
    player2Score = props.match.result.team1Player2Score;
    if(props.isTeam2){  
        teamScore = props.match.result.team2Score;
        player1Score = props.match.result.team2Player1Score;
        player2Score = props.match.result.team2Player2Score;
    }
}
</script>

<template> 
    <div class="MatchElementTeam"
        :class="{
            'mt-team-loose': match.result && (isTeam2 ? (match.result.team1Score > match.result.team2Score) : (match.result.team2Score > match.result.team1Score)),
            'mt-team-second': isTeam2
        }"
    >
        <div class="mt-team">
            <!-- TODO: Calculate correct Placeholder name -->
            <!-- <div class="mt-team-name">{{ team ? team.name : (isTeam2 ? "TBD" : "TBD") }}</div> -->
            <div class="mt-team-score" v-if="teamScore != undefined">{{ teamScore }}</div>
        </div>
        <div v-if="team && playersVisible">
            <div class="mt-team-player">
                <div class="mt-team-player-name">{{ team.players[0] }}</div>
                <div class="mt-team-player-score">{{ player1Score }}</div>
            </div>
            <div class="mt-team-player">
                <div class="mt-team-player-name">{{ team.players[1] }}</div>
                <div class="mt-team-player-score">{{ player2Score }}</div>
            </div>
        </div>

    </div>
</template>

<style scoped>
.MatchElementTeam{
    color: var(--main-color);
    display: flex;
    flex-direction: column-reverse;
}
.mt-team-second{
    color: var(--secondary-color);
    flex-direction: column;
}
.mt-team-loose{
    color: var(--loose-gray);
}
.mt-team{
    font-size: 18px;
    font-weight: bold;
    display: flex;
    align-items: center;
    min-height: 34px;
}
.mt-team-name{
    width: 100%;
    align-self: flex-end;
}
.mt-team-second .mt-team-name{
    align-self: flex-start;
}
.mt-team-score, .mt-team-player-score{
    background-color: var(--main-color);
    padding: 5px;
    color: white;
    width: 35px;
    text-align: center;
}
.mt-team-second .mt-team-score, .mt-team-second .mt-team-player-score{
    background-color: var(--secondary-color);
}
.mt-team-loose .mt-team-score, .mt-team-loose .mt-team-player-score{
    background-color: var(--loose-gray);
}
.mt-team-player{
    display: flex;
    align-items: center;
}
.mt-team-player-name{
    width: 100%;
    padding-left: 10px;
}
.mt-team-player-score{
    padding: 0px 5px;
}

/*MOBILE*/
@media (width <= 900px){
    .mt-team{
        font-size: 16px;
    }
    .mt-team-player{
        font-size: 16px;
    }
}

/*MOBILE S*/
@media (width <= 360px){
    .mt-team-name{
        font-size: 14px;
    }
    .mt-team-player{
        font-size: 14px;
    }
}
</style>