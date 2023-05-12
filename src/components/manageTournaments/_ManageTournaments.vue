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
        teams: [],
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
        <router-link class="ma-tournament" :to="'/Manage/' + tournament.name.replaceAll(' ','-')" v-for="tournament in tournaments" :key="tournament._id">{{ tournament.name }}</router-link>

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
