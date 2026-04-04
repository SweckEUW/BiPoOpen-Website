<script setup lang="ts">
import { ref } from "vue"
import router from '@/router.js';
import PlayerSearchAutoComplete from '@/components/shared/PlayerSearchAutoComplete.vue';
import Select from 'primevue/select';

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
let playerSearch = ref("");

const onPlayerSelect = (event: { value: string }) => {
	let name = event.value;
	toggleBurgerMenu();
	playerSearch.value = "";
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
						<PlayerSearchAutoComplete
							v-model="playerSearch"
							@item-select="onPlayerSelect"
							placeholder="Spieler suchen..."
							className="ap-player-autocomplete"
						/>
					</div>

					<div class="ap-search-block">
						<div class="ap-menu-title ap-menu-title-small">Turniere</div>
						<Select
							:modelValue="selectedTournament"
							:options="tournamentOptions"
							optionLabel="label"
							optionValue="value"
							placeholder="Turnier auswählen"
							appendTo="self"
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
.ap-player-autocomplete{
	position: relative;
}
.ap-tournament-dropdown{
	--p-select-background: rgba(255,255,255,0.16);
	--p-select-border-color: rgba(255,255,255,0.35);
	--p-select-color: #ffffff;
	--p-select-placeholder-color: rgba(255, 255, 255, 0.55);
	--p-select-overlay-background: rgba(255, 255, 255, 0.16);
	--p-select-overlay-border-color: rgba(255,255,255,0.35);
	--p-select-overlay-color: #ffffff;
	--p-select-option-color: #ffffff;
	--p-select-option-focus-color: #ffffff;
	--p-select-option-selected-color: #ffffff;
	--p-select-option-focus-background: rgba(255, 255, 255, 0.18);
	--p-select-option-selected-background: rgba(255, 255, 255, 0.24);
	--p-select-option-selected-focus-background: rgba(255, 255, 255, 0.24);
}
.ap-player-autocomplete :deep(.p-inputtext),
.ap-tournament-dropdown :deep(.p-select){
	background: rgba(255,255,255,0.16) !important;
	border: 1px solid rgba(255,255,255,0.35) !important;
	border-radius: 10px;
	color: white !important;
	font-size: 17px;
	outline: none;
}
.ap-player-autocomplete :deep(.p-inputtext){
	width: 100%;
	padding: 10px 14px;
}
.ap-tournament-dropdown :deep(.p-select){
	width: 100%;
	min-height: 43px;
}
.ap-tournament-dropdown :deep(.p-select-label),
.ap-tournament-dropdown :deep(.p-select-dropdown){
	background: transparent !important;
	color: #ffffff !important;
}
.ap-player-autocomplete :deep(.p-inputtext:focus),
.ap-tournament-dropdown :deep(.p-select.p-focus){
	box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.25);
}
.ap-tournament-dropdown :deep(.p-select-label){
	color: #fff;
	font-weight: 400;
}
.ap-tournament-dropdown :deep(.p-select-label.p-placeholder){
	color: rgba(255, 255, 255, 0.55) !important;
	background: transparent !important;
	opacity: 1 !important;
}
.ap-tournament-dropdown :deep(.p-select-dropdown){
	color: #ffffff;
}
.ap-player-autocomplete :deep(.p-inputtext::placeholder){
	color: rgba(255,255,255,0.75);
}
.ap-player-autocomplete :deep(.p-autocomplete-panel),
.ap-player-autocomplete :deep(.p-autocomplete-overlay),
.ap-tournament-dropdown :deep(.p-select-overlay){
	background: rgba(255, 255, 255, 0.16);
	border: 1px solid rgba(255,255,255,0.35);
	border-radius: 10px;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.14);
	backdrop-filter: blur(10px);
}
.ap-player-autocomplete :deep(.p-autocomplete-panel),
.ap-player-autocomplete :deep(.p-autocomplete-overlay){
	top: auto !important;
	bottom: calc(100% + 8px) !important;
	left: 0 !important;
	right: 0 !important;
	inset: auto 0 calc(100% + 8px) 0 !important;
	max-height: min(40vh, 280px);
}
.ap-tournament-dropdown :deep(.p-select-list-container){
	scrollbar-color: rgba(255, 255, 255, 0.95) rgba(255, 255, 255, 0.18);
}
.ap-tournament-dropdown :deep(.p-select-list-container::-webkit-scrollbar){
	width: 10px;
}
.ap-tournament-dropdown :deep(.p-select-list-container::-webkit-scrollbar-track){
	background: rgba(255, 255, 255, 0.18);
	border-radius: 10px;
}
.ap-tournament-dropdown :deep(.p-select-list-container::-webkit-scrollbar-thumb){
	background: rgba(255, 255, 255, 0.95);
	border-radius: 10px;
	border: 2px solid rgba(255, 255, 255, 0.18);
}
.ap-tournament-dropdown :deep(.p-select-list-container::-webkit-scrollbar-thumb:hover){
	background: #ffffff;
}
.ap-player-autocomplete :deep(.p-autocomplete-item),
.ap-player-autocomplete :deep(.p-autocomplete-option),
.ap-tournament-dropdown :deep(.p-select-option){
	color: white;
	font-weight: 600;
}
.ap-player-autocomplete :deep(.p-autocomplete-item:hover),
.ap-player-autocomplete :deep(.p-autocomplete-option:hover),
.ap-player-autocomplete :deep(.p-autocomplete-option.p-focus),
.ap-player-autocomplete :deep(.p-autocomplete-option.p-selected),
.ap-tournament-dropdown :deep(.p-select-option:hover),
.ap-tournament-dropdown :deep(.p-select-option.p-focus){
	color: white;
	background: rgba(255, 255, 255, 0.18);
}
.ap-player-autocomplete :deep(.p-autocomplete-option-label){
	color: inherit;
}
.ap-tournament-dropdown :deep(.p-select-option.p-selected){
	background: rgba(255, 255, 255, 0.24);
	color: white;
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