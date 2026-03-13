<script setup lang="ts">
import { ref } from "vue"
import router from '@/router.js';
import { getAllPlayerNames } from '@/components/frontend/playerProfile/PlayerProfileUtilFunctions';
import Dropdown from 'primevue/dropdown';
import AutoComplete from 'primevue/autocomplete';

let showBurger = ref(false);

const toggleBurgerMenu = () =>{
	showBurger.value = !showBurger.value;
	document.getElementsByClassName("ap-burger")[0].classList.toggle("change");
}

const scrollToTop = () => {
	if((router as any).path == "/"){
		document.getElementsByTagName("html")[0].style.scrollBehavior = "smooth";
		setTimeout(() => { window.scrollTo(0, 0); }, 0);
		setTimeout(() => { document.getElementsByTagName("html")[0].style.scrollBehavior = ""; }, 1000);
	}
}

let logo = new URL(`/src/assets/Logo_Website.svg`, import.meta.url).href;

let tournaments = ['Weck BiPo Open 2025', 'Weck BiPo Open 2024', 'Weck BiPo Open 2023', 'Weck BiPo Open 2022', 'Weck BiPo Open 2021', 'Weck BiPo Open 2020'];
const tournamentOptions = tournaments.map(tournament => ({
	label: tournament,
	value: '/' + tournament.replaceAll('Weck BiPo Open ', '').replaceAll(' ', '-')
}));
const selectedTournament = ref<string | null>(null);

// Player search
let playerNames = ref<string[]>([]);
let playerNamesLoading = ref(false);
let playerNamesLoaded = ref(false);
let playerSearch = ref("");
let playerSuggestions = ref<string[]>([]);

const loadPlayerNames = async () => {
	if(playerNamesLoaded.value || playerNamesLoading.value) return;
	playerNamesLoading.value = true;
	playerNames.value = await getAllPlayerNames();
	playerNamesLoading.value = false;
	playerNamesLoaded.value = true;
}

const searchPlayers = async (event: { query: string }) => {
	const query = event.query.trim().toLowerCase();
	if(!query){
		playerSuggestions.value = [];
		return;
	}

	if(!playerNamesLoaded.value) await loadPlayerNames();
	playerSuggestions.value = playerNames.value
		.filter(name => name.toLowerCase().includes(query))
		.slice(0, 15);
};

const onPlayerSelect = (event: { value: string }) => {
	let name = event.value;
	toggleBurgerMenu();
	playerSearch.value = "";
	playerSuggestions.value = [];
	router.push(`/Spieler/${encodeURIComponent(name).replaceAll('%20', '-')}`);
};

const onTournamentSelect = (value: string | null) => {
	if(!value) return;
	toggleBurgerMenu();
	router.push(value);
	selectedTournament.value = null;
};

</script>

<template>
	<div class="AppHeader">

		<div class="ap-header">
			<div class="ap-logo">
				<router-link to="/" @click="scrollToTop()">
					<img :src="logo" alt="">
				</router-link>
			</div>
			
			<div class="ap-burger" @click="toggleBurgerMenu()">
				<div class="bar1"></div>
				<div class="bar2"></div>
				<div class="bar3"></div>
			</div>
		</div>
		
		<transition name="fade" mode="out-in">
			<div class="ap-menu" v-show="showBurger">
				<div class="ap-menu-content">
					<router-link @click="toggleBurgerMenu()" class="ap-menu-title" :to="'/Regeln'">Regeln</router-link>
					<router-link @click="toggleBurgerMenu()" class="ap-menu-title" :to="'/Hall-Of-Fame'">Hall Of Fame</router-link>
					<router-link @click="toggleBurgerMenu()" class="ap-menu-title" :to="'/Offene-Spiele'">Offene Spiele</router-link>
					<!-- <router-link @click="toggleBurgerMenu()" class="ap-menu-title" :to="'/BiPo-Knecht'">BiPo Knecht</router-link> -->
					<router-link @click="toggleBurgerMenu()" class="ap-menu-title" :to="'/League'">BiPo League</router-link>

					<div class="ap-search-block">
						<div class="ap-menu-title ap-menu-title-small">Spieler</div>
						<AutoComplete
							v-model="playerSearch"
							:suggestions="playerSuggestions"
							@complete="searchPlayers"
							@item-select="onPlayerSelect"
							placeholder="Spieler suchen..."
							class="ap-player-autocomplete"
							:dropdown="false"
						/>
					</div>

					<div class="ap-search-block">
						<div class="ap-menu-title ap-menu-title-small">Turniere</div>
						<Dropdown
							:modelValue="selectedTournament"
							:options="tournamentOptions"
							optionLabel="label"
							optionValue="value"
							placeholder="Turnier auswählen"
							class="ap-tournament-dropdown"
							@update:modelValue="onTournamentSelect"
						/>
					</div>
				</div>
			</div>
		</transition>

	</div>
</template>

<style scoped>
.AppHeader{
	width: 100%;
	z-index: 99;
	position: fixed;
	top: 0px;
	filter: drop-shadow(0px 0px 100px rgba(255, 255, 255, 0.295));
	padding: 20px 5%;
	padding-top: 30px;
	background: white;
}

.ap-header{
	display: flex;
	align-items: center;
}

/* LOGO + NAME */
.ap-logo a{
	display: flex;
	justify-content: center;
	align-items: center;
}
.ap-logo img{
	width: 255px;
	height: 40px;
}

/* MENU */
.ap-menu{
	width: 100vw;
	height: 100vh;
	position: absolute;
	z-index: 2;
	left: 0;
	top: 0;
	display: flex;
	align-items: center;
	flex-direction: column;
	background-color: var(--main-color);
	overflow-y: scroll;
	padding: 70px 16px 30px;
}
.ap-menu-content{
	width: min(520px, 90vw);
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
}
.ap-menu-title{
	text-decoration: none;
	color: white;
	font-size: 40px;
	font-weight: bolder;
	margin: 0;
	text-align: center;
	display: inline-block;
	transition: .3s opacity ease;
}
.ap-menu-title-small{
	font-size: 26px;
	margin-top: 16px;
	margin-bottom: 8px;
}
a:hover{
	opacity: 0.5;
	color: white;
}

/* Player Search */
.ap-search-block{
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
	margin-top: 2px;
}
.ap-player-autocomplete,
.ap-tournament-dropdown{
	width: 100%;
}
.ap-player-autocomplete :deep(.p-inputtext),

.ap-tournament-dropdown :deep(.p-dropdown),
.ap-tournament-dropdown :deep(.p-dropdown-label),
.ap-tournament-dropdown :deep(.p-dropdown-trigger){
	background: rgba(255,255,255,0.16);
	border: 1px solid rgba(255,255,255,0.35);
	border-radius: 10px;
	color: white;
	font-size: 17px;
	outline: none;
}
.ap-player-autocomplete :deep(.p-inputtext){
	width: 100%;
	padding: 10px 14px;
}
.ap-tournament-dropdown :deep(.p-dropdown){
	width: 100%;
	min-height: 44px;
	background: linear-gradient(135deg, rgba(234, 81, 96, 0.3), rgba(97, 195, 217, 0.22));
	border-color: rgba(255, 255, 255, 0.55);
}
.ap-player-autocomplete :deep(.p-inputtext:focus),
.ap-tournament-dropdown :deep(.p-dropdown.p-focus){
	box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.25);
}
.ap-tournament-dropdown :deep(.p-dropdown-label){
	color: #fff;
	font-weight: 700;
}
.ap-tournament-dropdown :deep(.p-dropdown-label.p-placeholder){
	color: rgba(255, 255, 255, 0.86);
}
.ap-tournament-dropdown :deep(.p-dropdown-trigger-icon){
	color: #ffffff;
}
.ap-player-autocomplete :deep(.p-inputtext::placeholder){
	color: rgba(255,255,255,0.75);
}
.ap-player-autocomplete :deep(.p-autocomplete-panel),
.ap-tournament-dropdown :deep(.p-dropdown-panel){
	background: #f8fbff;
	border: 1px solid rgba(18, 40, 76, 0.14);
	border-radius: 10px;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.14);
}
.ap-player-autocomplete :deep(.p-autocomplete-item),
.ap-tournament-dropdown :deep(.p-dropdown-item){
	color: var(--main-color);
	font-weight: 600;
}
.ap-player-autocomplete :deep(.p-autocomplete-item:hover),
.ap-tournament-dropdown :deep(.p-dropdown-item:hover){
	background: rgba(97, 195, 217, 0.18);
}
.ap-tournament-dropdown :deep(.p-dropdown-panel){
	background: linear-gradient(180deg, #fff7f8 0%, #f3fbfd 100%);
	border: 1px solid rgba(234, 81, 96, 0.26);
}
.ap-tournament-dropdown :deep(.p-dropdown-item){
	color: #a72b3b;
}
.ap-tournament-dropdown :deep(.p-dropdown-item.p-highlight){
	background: rgba(234, 81, 96, 0.14);
	color: #7f1f30;
}
.ap-tournament-dropdown :deep(.p-dropdown-item:hover){
	background: rgba(97, 195, 217, 0.22);
	color: #7f1f30;
}
.ap-search-hint{
	margin-top: 6px;
	color: rgba(255, 255, 255, 0.75);
	font-size: 13px;
}

/* BURGER */
.ap-burger{
	cursor: pointer;
	z-index: 99;
	padding: 10px;
	margin-left: auto;
}
.bar1, .bar2, .bar3 {
	width: 35px;
	height: 3px;
	background-color: var(--main-color);
	margin: 5px 0;
	transition: 0.4s;
}
.change .bar1, .change .bar2, .change .bar3{
	background: white;
}
.change .bar1 {
	transform: translate(0, 8px) rotate(-45deg);
}
.change .bar2 {
	opacity: 0;
}
.change .bar3 {
	transform: translate(0, -8px) rotate(45deg);
}

/*MOBILE*/
@media (width <= 900px){
	.AppHeader{
		padding-top: 20px;
		padding: 15px 5%;
	}
	.ap-logo a{
		font-size: 20px;
		margin-top: 4px !important;
		margin-bottom: 0px !important;
	}
	.ap-logo img{
		width: 180px;
		height: 30px;
	}
	.ap-logo a:hover{
		opacity: 1;
		color: var(--main-color);;
	}
	.ap-menu{
		padding-top: 78px;
	}
	.ap-menu-content{
		width: min(420px, 92vw);
	}
	.ap-menu-title-small{
		font-size: 24px;
		margin-top: 12px;
	}
	a:hover{
		opacity: 1;
	}
	.ap-menu-title{
		font-size: 31px;
	}
}

/*MOBILE S*/
@media (width <= 360px){
    .ap-menu-title{
		font-size: 28px;
	}
}
</style>