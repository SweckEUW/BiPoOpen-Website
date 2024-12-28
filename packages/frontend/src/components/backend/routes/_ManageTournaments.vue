<script setup lang="ts">
import { ref } from "vue"
import Modal from '@/components/shared/Modal.vue';
import { getAllTournaments, addTournament } from "@/util/tournamentUtilFunctions";

let tournaments = ref<Tournament[]|undefined>();

const getTournaments = async () => {
    tournaments.value = await getAllTournaments();
}
getTournaments();

const createTournament = async () => {
    let tournament:Tournament = {
        _id: '', // Add a default or generate an ID
        name: tournamentName.value,
        teams: [], // Initialize teams as an empty array
        groupPhase: {
            groups: [],
            matches: []
        },
        koPhase: {
            matches: []
        },
        settings: {
            trackPlayerShots: true,
            trackTeamShots: true,
            fixedGroupAmmount: 8,
            advancingTeamsPerGroup: 2,
        }
    }

    // DEBUG 2023!
    // tournament.teams = [
    //     {name: "Messerstecher", players: ["Simon Weck", "Nick Brinkrolf"]},
    //     {name: "Alkoholigans", players: ["Philipp Karaula", "René Manke"]},
    //     {name: "Berufsalkoholiker", players: ["Leon Rose", "Jonas Weck"]},
    //     {name: "Die Tauebn Nüsschen", players: ["Patrick Pohlmann", "Tim Becker"]},
    //     {name: "Eintracht Prügel", players: ["Alexander Borsig", "Björn Harz"]},
    //     {name: "Team Sunburn", players: ["David Jones", "Marco Radziej"]},
    //     {name: "Malle Schlauchkombo", players: ["Jens Schauf", "Marius Berger"]},
    //     {name: "Sex-Touristen", players: ["Marius Grote", "Leonard Südbrock"]},
    //     {name: "AS Koma", players: ["Antonio Melechi", "Yannick Overbeck"]},
    //     {name: "Die Beatmungsgeräte", players: ["Sham Hasso", "Nur-Sena Yildiz"]},
    //     {name: "Taktisches Vorrundenaus", players: ["Giulia Sanio", "Jana Meerbecker"]},
    //     {name: "Für Gigolo", players: ["Stefan Linke", "Marvin Brinkrolf"]},
    //     {name: "Team Anime", players: ["Paul Falkenreck", "Anica Hollenbeck"]},
    //     {name: "Peter Pong & Trinkerbell", players: ["Svenja Förster", "Pascal Kurz"]},
    //     {name: "Die Narren", players: ["Matthias Weck", "Lennard Kaffitz"]},
    //     {name: "One Punsh Bitches", players: ["Fritz Falkenreck", "Jenny Lemke"]},
    //     {name: "Leon & Ruben", players: ["Leon Breuker", "Ruben Heuser"]},
    //     {name: "Anna & Leo", players: ["Anna Müller", "Leo Straub"]},
    //     {name: "5 in 5", players: ["Philipp Pohlman", "Raik Buxel"]},
    //     {name: "Jannick & Freddi", players: ["Jannick Becker", "Freddi Reckhaus"]},
    //     {name: "Blau wie der Ozean", players: ["Michelle Langer", "Maya Langer"]},
    //     {name: "Nico & Mats", players: ["Nico Kreimer", "Mats Düser"]},
    //     {name: "Bierus Pongus", players: ["Matthias Gunter", "Martin Brandt"]},
    //     {name: "FC Energie Kopfnuss", players: ["Alexander Heitmann", "Jens Ossenbrink"]},
    //     {name: "Baywatch", players: ["Peter Junker", "Tobias Mootz"]},
    //     {name: "Designated Last Place", players: ["Nadja Pohlmann", "Sina Westhus"]},
    //     {name: "Brews Brothers", players: ["Paolo Wohlfahrt", "Marvin Brandt"]},
    //     {name: "Charly & Chiara", players: ["Charly Bramers", "Chiara Sochart"]},
    //     {name: "Lovis & Marco", players: ["Lovis Büker", "Marco Grinder"]},
    //     {name: "Baris & Sophie", players: ["Baris Güntekin", "Sophie Güntekin"]},
    //     {name: "Rando & Christina", players: ["Rando Schvede", "Christina Wicht"]},
    //     {name: "Arno Dübel Fanclub", players: ["Kevin Krumscheidt", "Pascal Kronenberg"]}
    // ]

    // DEBUG 2022!
    // tournament.teams = [
    //     {"name": "Bierkönig*innen","players": ["Esther ?","Dennis ?"]},
    //     {"name": "Messerstecher","players": ["Simon Weck","Nick Brinkrolf"]},
    //     {"name": "Die Bunten Banausen","players": ["Charlie ?","Laura ?"]},
    //     {"name": "Geile Brille Trotz 4 Promille","players": ["Jonas Weck","Leon Rose"]},
    //     {"name": "Die Stecher","players": ["Dana Pohlmann","Sally ?"]},
    //     {"name": "Elotrance","players": ["Jerome Campigotto","Marvin Brandt"]},
    //     {"name": "Team Kanto","players": ["Fritz Falkenreck","Jenny Lemke"]},
    //     {"name": "Bierschiss","players": ["Tom Pohlschmidt","Jannick Becker"]},
    //     {"name": "Elitepartner","players": ["Matthias Gunter","Paulo Wohlfahrt"]},
    //     {"name": "Airballers","players": ["Celina Mercedes","Madelaine"]},
    //     {"name": "Pong Daddy's","players": ["Matthias Weck","Lennard Kaffitz"]},
    //     {"name": "#BANKERBOYS","players": ["Alexander Borsig","Björn Harz"]},
    //     {"name": "Taube Nüsschen","players": ["Patrick Pohlmann","Tim Becker"]},
    //     {"name": "Anime Lover","players": ["Paul Falkenreck","Anica Hollenbeck"]},
    //     {"name": "Bierpolare Störung","players": ["Giulia Sanio","Tommy Sanio"]},
    //     {"name": "Bieranjas","players": ["Nele Wonnemann","Nicole Brandt"]},
    //     {"name": "Jetzt schon blau","players": ["Michelle Langer","Niklar Moritz"]},
    //     {"name": "3,1 Bier","players": ["David Jones","Vivien ?"]},
    //     {"name": "The Gentlemänners","players": ["Daniel Wonnemann","Martin Brandt"]},
    //     {"name": "Emotional Damage","players": ["Sham Hasso","Nur-Sena Yildiz"]}
    // ]
    
    let success = await addTournament(tournament);
    if(success){
        await getTournaments();
        tournamentName = ref();
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
        <div class="bp-button" @click="toggleModal()">Neues Turnier erstellen</div>
        
        <router-link class="ma-tournament" :to="'/Manage/' + tournament.name.replaceAll(' ','-')" v-for="tournament in tournaments" :key="tournament.name">{{ tournament.name }}</router-link>

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
.ma-tournament{
    padding: 20px;
    background: white;
    cursor: pointer;
    color: black;
    text-align: center;
    margin-bottom: 50px;
    filter: drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.3));
    text-decoration: none;
}
.ma-tournament:hover{
    background: rgb(207, 207, 207);
}
</style>
