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

:root {
  --main-color: #EA5160;
  --secondary-color: #61C3D9;
  --secondary-color-weak: #d3f7ff;
  --main-color-hover: rgb(241, 200, 200);
  --loose-gray: rgb(209, 209, 209);
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
	margin-top: 150px;
	padding-bottom: 50px;
	min-height: calc(100vh - 200px - 80px);
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
}
.bp-title{
	margin-bottom: 40px;
	color: var(--main-color);
    font-size: 40px;
	width: 100%;
    text-align: center;
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
	.Page{
		margin-top: 80px;
		width: 95%;
		padding-bottom: 30px;
	}
	.bp-title{
		font-size: 28px;
		margin-bottom: 30px;
	}
}
</style>