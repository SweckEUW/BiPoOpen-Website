<script setup lang="ts">
import axios from "axios";
import { ref } from "vue"

let teamname = ref("");
let player1 = ref("");
let player2 = ref("");

const createTeam = async () => {
    let response = await axios.post("/createTeam", {name: teamname.value, player1: {name: player1.value}, player2: {name: player2.value}});
    console.log(response.data.message);
    if(response.data.success){
        await getTeams();
        teamname.value = "";
        player1.value = "";
        player2.value = "";
    }
}

let teams = ref();
const getTeams = async () => {
    let response = await axios.get("/teams")
    console.log(response.data.message);
    if(response.data.success)
        teams.value = response.data.teams;
}
getTeams();
</script>

<template>
    <div class="Teamanmeldung">
        
        <div class="ta-form">
            <div class="ta-form-title">Teamanmeldung</div>

            <div class="ta-from-block">
                <div>Teamname</div>
                <input type="text" v-model="teamname" placeholder="Teamname">
            </div>

            <div class="ta-from-block">
                <div>Spieler</div>
                <input type="text" v-model="player1" placeholder="Vorname Nachname">
                <input type="text" v-model="player2" placeholder="Vorname Nachname">
            </div>

            <div class="ta-form-button" @click="createTeam()">Absenden</div>
        </div>

        <div class="ta-answers">
            <div class="ta-form-title">Angemeldete Teams</div>

            <div v-for="team in teams" :key="team._id" class="ta-answer-team">
                <div>
                    <div class="ta-answer-heading">Teamname:</div>
                    <div class="ta-answer-data">{{ team.name }}</div>
                </div>

                <div>
                    <div class="ta-answer-heading">Spieler 1:</div>
                    <div class="ta-answer-data">{{ team.player1.name }}</div>
                </div>

                <div>
                    <div class="ta-answer-heading">Spieler 2:</div>
                    <div class="ta-answer-data">{{ team.player2.name }}</div>
                </div>
            </div>
        </div>
    
    </div>
</template>
<style scoped>
.Teamanmeldung{
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
}   

/* Form */
.ta-form{
    width: 300px;
}
.ta-form-title{
    font-size: 24px;
    text-align: center;
    font-weight: bolder;
    margin-bottom: 20px;
}
.ta-from-block{
    margin-bottom: 15px;
}
.ta-form input{
    color: black;
    margin-bottom: 20px;
    width: calc(100% - 10px);
    padding: 5px;
    border: 1px solid black;
    border-radius: 2px;
    font-size: 18px;
    outline: none;
    margin-bottom: 2px;
}
.ta-form input::placeholder {
  color: rgb(190, 190, 190);
  opacity: 1; /* Firefox */
  font-size: 16px;
}
.ta-form-button{
    padding: 10px;
    cursor: pointer;
    background: black;
    color: white;
    text-align: center;
}

/* Answers */
.ta-answers{
    margin-top: 50px;
    width: 90%;
    font-size: 17px;
}
.ta-answer-team{
    padding: 10px 50px;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
    margin-bottom: 20px;
}
.ta-answer-heading{
    display: inline-block;
    width: 110px;
    font-weight: bolder;
}
.ta-answer-data{
    display: inline;
}

/*MOBILE*/
@media (width <= 900px){
	.ta-form{
        width: 90%;
        font-size: 20px;
    }
}
</style>
