<script lang="ts" setup>
import AppHeader from '@/components/shared/AppHeader.vue';
// import AppFooter from '@/components/shared/AppFooter.vue';

import { onBeforeMount } from 'vue'
import router from './router.js';
import axios from "axios";

onBeforeMount(() => {
	// Configure Axios
	axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

	// Redirect
	let path = localStorage.getItem('path');
	if(path){
		localStorage.removeItem('path');
		router.push(path);
	}
})
</script>

<template>
	<!-- App header -->
	<AppHeader/>

	<div class="Page">
		<router-view v-slot="{ Component }">
			<transition name="fade-page" mode="out-in">
				<component :is="Component"/>
			</transition>
		</router-view>
	</div>

	<!-- App footer -->
	<!-- <AppFooter/> -->
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Overpass:wght@100&display=swap');

body{
	font-family: Overpass, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	scrollbar-width: none;
	margin: 0;
	overflow-x: hidden;
}
#app{
	overflow-x: hidden;
}

a{
	text-decoration: none;
	color: black;
}
.Page{
	margin-top: 100px;
	padding-bottom: 100px;
	min-height: calc(100vh - 300px - 80px);
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
</style>