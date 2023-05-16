<script setup lang="ts">
import axios from "axios";
import { ref } from "vue"
import Modal from '@/components/shared/Modal.vue';

let tournaments = ref();

const getTournaments = async () => {
    let response = await axios.get("/tournaments")
    console.log(response.data.message);
    if(response.data.success)
        tournaments.value = response.data.tournaments;
}
getTournaments();

const createTournament = async () => {
    let tournament = {
        name: tournamentName.value,
        groupPhase: {
            settings: {
                fixedGroupAmmount: 8
            }
        },
        teams: [
            {name: "Messerstecher", players: ["Simon Weck", "Nick Brinkrolf"]},
            {name: "Grün Weiß Altglas", players: ["Joel Kiwitt", "René Manke"]},
            {name: "Team MöpMöp", players: ["Leon Rose", "Jonas Weck"]},
            {name: "Die Tauebn Nüsschen", players: ["Patrick Pohlmann", "Tim Becker"]},
            {name: "Eintracht Prügel", players: ["Alexander Borsix", "Björn Harz"]},
            {name: "Team Sunburn", players: ["David Jones", "Marco Radziej"]},
            {name: "Schauf & Berger", players: ["Jens Schauf", "Marius Berger"]},
            {name: "Sex-Touristen", players: ["Marius Grote", "Leonard Südbrock"]},
            {name: "AS Koma", players: ["Antonio Melechi", "Yannick ?"]},
            {name: "Die Beatmungsgeräte", players: ["Sham Hasso", "Nur-Sena Yildiz"]},
            {name: "Taktisches Vorrundenaus", players: ["Giulia Sanio", "Jana Meerbecker"]},
            {name: "Für Gigolo", players: ["Stefan Linke", "Marvin Brinkrolf"]},
            {name: "Team Anime", players: ["Paul Falkenreck", "Anica Hollenbeck"]},
            {name: "Peter Pong & Trinkerbell", players: ["Svenja Förster", "Pascal Kurz"]},
            {name: "Rosenbaum & Grahl", players: ["Cornelius Rosenbaum", "Hanna Grahl"]},
            {name: "Die Narren", players: ["Matthias Weck", "Lennard Kaffitz"]},
            {name: "One Punsh Bitches", players: ["Fritz Falkenreck", "Jenny ?"]},
            {name: "Breuker & Heuser", players: ["Leon Breuker", "Ruben Heuser"]},
            {name: "Müller & Straub", players: ["Anna Müller", "Leo Straub"]},
            {name: "Wohlfahrt & Brandt", players: ["Paolo Wohlfahrt", "Marvin Brandt"]},
            {name: "Becker & Gödde", players: ["Jannick Becker", "Steffen Gödde"]},
            {name: "Langer & ?", players: ["Michelle Langer", "Maya ?"]},
            {name: "Steinkemper & ?", players: ["Alexander Steinkemper", "?"]},
            {name: "Junker & ?", players: ["Peter Junger", "?"]}
        ],
    }
    let response = await axios.post("/createTournament", tournament);
    console.log(response.data.message);
    if(response.data.success){
        await getTournaments();
        toggleModal();
    }
}

let showModal = ref(false);
const toggleModal = () => {
    showModal.value = !showModal.value;
}

let tournamentName = ref();
</script>

<template>
    <div class="Manage">
        <div class="ma-create" @click="toggleModal()">Neues Turnier erstellen</div>
        <router-link class="ma-tournament" :to="'/Manage/' + tournament.name.replaceAll(' ','-')" v-for="tournament in tournaments">{{ tournament.name }}</router-link>

        <Transition name="fade">
            <Modal v-if="showModal">
                <template #title>Neues Turnier erstellen</template>
                <template #template>
                    <div>Turniername</div>
                    <input type="text" v-model="tournamentName">
                </template>
                <template #cancle>
                    <div @click="toggleModal()">Abbrechen</div>
                </template>
                <template #confirm>
                    <div @click="createTournament();">Erstellen</div>
                </template>
            </Modal>
        </Transition>
    </div>
</template>

<style scoped>
.Manage{
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.ma-create{
    padding: 20px;
    background: purple;
    cursor: pointer;
    color: white;
    text-align: center;
    margin-bottom: 50px;
}
.ma-create:hover{
    background: rgb(80, 0, 80);
}
.ma-tournament{
    padding: 20px;
    background: white;
    cursor: pointer;
    color: black;
    text-align: center;
    margin-bottom: 50px;
    filter: drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.3));
}
.ma-tournament:hover{
    background: rgb(207, 207, 207);
}
</style>
