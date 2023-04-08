<script setup lang="ts">
// import AppHeader from './components/shared/AppHeader.vue';
import { onBeforeMount } from 'vue'
import router from './router.js';

onBeforeMount(() => {
  let path = localStorage.getItem('path');
  if(path){
    localStorage.removeItem('path');
    router.push(path);
  }
})
</script>

<template>
	<transition name="fadeStart" appear>
		<div>
			<!-- App header -->
			<!-- <AppHeader/> -->

			<!-- Render active component contents with vue transition -->
			<router-view v-slot="{ Component }">
				<transition name="fade" mode="out-in">
					<component :is="Component" class="Page"/>
				</transition>
			</router-view>

			<!-- App footer -->
			<!-- <AppFooter/> -->
		</div>
	</transition>
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
.Page{
	margin-top: 200px;
	padding-bottom: 100px;
	min-height: calc(100vh - 300px - 80px);
}
.fadeStart-enter-active, .fadeStart-leave-active {
  transition: 1s opacity 0s ease;
}
.fadeStart-enter-from,.fadeStart-leave-to {
  opacity: 0;
}
/* Transition Animations */
.fade-enter-active {
	animation: coming 0.4s;
	animation-delay: 0.2s;
	opacity: 0;
}
.fade-leave-active {
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
/*DESKTOP SMALL*/
@media (width <= 1200px) { 
    h1{
        font-size: 100px;
    }
}
/*MOBILE*/
@media (width <= 900px){
	.Page{
		margin-top: 130px;
		padding-bottom: 30px;
	}
	h1{
		font-size: 50px;
		margin-bottom: 20px;
	}
}
</style>