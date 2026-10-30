<script lang="ts" setup>
import AppHeader from '@/components/shared/AppHeader.vue';
import AppFooter from '@/components/shared/AppFooter.vue';
import AppBottomNav from '@/components/shared/AppBottomNav.vue';
import TournamentPickerDrawer from '@/components/shared/TournamentPickerDrawer.vue';
import AddGameDrawer from '@/components/shared/GameEntry/AddGameDrawer.vue';
import PlayerProfileDrawer from '@/components/frontend/playerProfile/PlayerProfileDrawer.vue';
import Toast from 'primevue/toast';
import { Analytics } from '@vercel/analytics/vue';
import { SpeedInsights } from '@vercel/speed-insights/vue';

import { onBeforeMount, ref, provide } from 'vue'
import router from './router.js';
import axios from "axios";

// Global player profile drawer
let playerProfileVisible = ref(false);
let playerProfileName = ref('');

const openPlayerProfile = (name: string) => {
	playerProfileName.value = name;
	playerProfileVisible.value = true;
};

provide('openPlayerProfile', openPlayerProfile);

onBeforeMount(async() => {
	// Configure Axios
	axios.defaults.baseURL = "https://bipoopen-backend.vercel.app/";
	// axios.defaults.baseURL = "http://localhost:8080";

	// Redirect		
	let path = localStorage.getItem('path');
	if(path){
		localStorage.removeItem('path');
		router.push(path);
	}
})
</script>

<template>
	<Toast position="bottom-right" />
	<Analytics/>
	<SpeedInsights/>

	<!-- App header -->
	<AppHeader/>

	<div class="Page">
		<router-view v-slot="{ Component }" :key="$route.fullPath">
			<transition name="fade-page" mode="out-in">
				<component :is="Component"/>
			</transition>
		</router-view>
	</div>

	<!-- App footer -->
	<AppFooter/>

	<!-- Mobile bottom navigation + tournament picker + "Spiel eintragen" (Plus in der Navigation) -->
	<AppBottomNav/>
	<TournamentPickerDrawer/>
	<AddGameDrawer/>

	<!-- Global Player Profile Drawer -->
	<PlayerProfileDrawer
		v-model:visible="playerProfileVisible"
		:playerName="playerProfileName"
	/>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Overpass:wght@100&display=swap');
@import "tailwindcss";

:root {
  --main-color: #EA5160;
  --secondary-color: #61C3D9;
  --secondary-color-weak: #d3f7ff;
  --main-color-hover: rgb(241, 200, 200);
  --loose-gray: rgb(209, 209, 209);
  --page-gray: #F6F7F9;
  --app-header-height: 72px;
  --app-bottom-nav-height: 64px;
}

body{
	font-family: Overpass, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	scrollbar-width: none;
	margin: 0;
}

.Page{
	margin: auto;
	margin-top: calc(var(--app-header-height) + 51px);
	padding-bottom: 50px;
	min-height: calc(100dvh - var(--app-header-height) - 47px - 80px);
	width: 90%;
}
.bp-button{
	padding: 20px;
	background: var(--main-color);
	cursor: pointer;
	color: white;
	text-align: center;
	margin-bottom: 50px;
	transition: .3s background ease;
	text-decoration: none;
}
.bp-button:hover{
	background: var(--main-color-hover);
	color: white;
}
.bp-title{
	margin: 0;
	padding: 10px 0 16px;
	color: var(--main-color);
	font-size: 36px;
	font-weight: 700;
	line-height: 1.15;
	text-align: left;
}

/* Transition Animations */
.fade-page-enter-active {
	animation: coming 0.4s;
	animation-delay: 0.2s;
	opacity: 0;
}
.fade-page-leave-active {
	animation: going 0.4s;
}
@keyframes going {
	from {
		transform: translateX(0);
	}
	to {
		transform: translateX(-10px);
		opacity: 0;
	}
}
@keyframes coming {
	from {
		transform: translateX(-10px);
		opacity: 0;
	}
	to {
		transform: translateX(0px);
		opacity: 1;
	}
}

/* Fade Transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
@media (width <= 900px){
	:root{
		--app-header-height: 54px;
	}
	body{
		padding-bottom: calc(var(--app-bottom-nav-height) + env(safe-area-inset-bottom));
	}
	.Page{
		margin-top: calc(var(--app-header-height) + 1px);
		width: 95%;
		padding-bottom: 30px;
		min-height: calc(100dvh - var(--app-header-height) + 4px - 80px - var(--app-bottom-nav-height));
	}
	.bp-title{
		font-size: 28px;
		padding: 12px 0 14px;
	}
}

/*MOBILE S*/
@media (width <= 360px){
    .bp-title{
		font-size: 22px !important;
	}
}

.p-toast .p-toast-message-enter-active, .p-toast .p-toast-message-leave-active {
	transition: transform 0.3s ease, opacity 0.3s ease !important;
	animation: none !important;
}
.p-toast .p-toast-message-enter-from , .p-toast .p-toast-message-leave-to {
  	opacity: 0;
	transform: translateX(80%)
}

/* Toast close button hidden */
.p-toast .p-toast-close-button {
	display: none !important;
}

/* Toast mobile */
@media (width <= 900px){
	.p-toast.p-toast-bottom-right {
		right: 0;
		bottom: calc(var(--app-bottom-nav-height) + env(safe-area-inset-bottom));
		left: 0;
		width: 100%;
		padding: 10px;
	}
}
</style>