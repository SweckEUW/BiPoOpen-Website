<script setup lang="ts">
import axios from "axios";
import { ref } from "vue"

let teams = ref();

axios.get("https://bipoopen-backend.vercel.app/teams").then(response =>{ //http://localhost:8000/teams
    console.log(response.data);
    teams.value = response.data;
});
</script>

<template>
    <div class="Page">
        <h1>Teams</h1>
        <div v-for="team in teams" :key="team._id">
            <div>{{ "Name: " + team.name }}</div>
            <div style="display: inline">Players: </div>
            <div v-for="(player,index) in team.players" :key="player" style="display: inline">{{ player + (index < team.players.length-1 ? ", " : "") }}</div>
        </div>
    </div>
</template>

<style scoped>
h1{
    margin-top: 200px;
    width: 100%;
    text-align: center;
}
</style>
