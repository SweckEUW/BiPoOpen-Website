<script setup lang="ts">
import { ref } from "vue"
import router from '@/router.js';

import DropDown from '@/components/shared/DropDown.vue';
import tournaments from '@/assets/tournaments.json';

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

let logo:string = new URL(`/src/assets/Logo_Website.svg`, import.meta.url).href;
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

				<router-link @click="toggleBurgerMenu()" class="ap-menu-title" :to="'/Regeln'">Regeln</router-link>
				<router-link @click="toggleBurgerMenu()" class="ap-menu-title" :to="'/Hall-Of-Fame'">Hall Of Fame</router-link>

				<div v-for="tournament in tournaments" :key="tournament.name">
					<DropDown :name="tournament.name" :isOpen="tournament.name == '2024'"> <!-- :isOpen="tournament.name == 'Kirmes 2023'" -->
						<template #header>
							<div class="ap-dropdown-title">{{tournament.name}}</div>
						</template>
						<template #content>
							<!-- <router-link class="ap-dropdown-link" @click="toggleBurgerMenu()" :to="'/' + tournament.year + '/Zusammenfassung'" v-if="tournament.games">Zusammenfassung</router-link> -->
							<router-link class="ap-dropdown-link" @click="toggleBurgerMenu()" :to="'/' + tournament.name.replaceAll(' ','-') + '/Platzierungen'" v-if="tournament.games">Platzierungen</router-link>
							<router-link class="ap-dropdown-link" @click="toggleBurgerMenu()" :to="'/' + tournament.name.replaceAll(' ','-') + '/Spielplan'" v-if="tournament.games">Spielplan</router-link>
							<router-link class="ap-dropdown-link" @click="toggleBurgerMenu()" :to="'/' + tournament.name.replaceAll(' ','-') + '/MVP'" v-if="tournament.mvp">Most Valuable Player</router-link>
							<!-- <router-link class="ap-dropdown-link" @click="toggleBurgerMenu()" :to="'/' + tournament.name.replaceAll(' ','-') + '/Teams'" v-if="tournament.games">Teams</router-link> -->
							<!-- <router-link class="ap-dropdown-link" @click="toggleBurgerMenu()" :to="'/' + tournament.name.replaceAll(' ','-') + '/Teams'" v-if="tournament.name == '2024'">Teams</router-link> -->
							<router-link class="ap-dropdown-link" @click="toggleBurgerMenu()" :to="'/' + tournament.name.replaceAll(' ','-') + '/Fotos'" v-if="tournament.fotos">Fotos</router-link>
						</template>
					</DropDown>
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
}
.ap-menu-title{
	text-decoration: none;
	color: white;
	font-size: 50px;
	font-weight: bolder;
	margin-top: 0px;
	margin-bottom: 20px;
	text-align: center;
	display: inline-block;
	transition: .3s opacity ease;
}
.ap-menu-title:first-of-type{
	margin-top: 15vh !important;
}
.ap-dropdown-title{
	color: white;
	font-size: 50px;
	font-weight: bolder;
	margin-top: 0px;
	text-align: center;
	display: inline-block;
	transition: .3s opacity ease;
	margin-right: 20px;
}
.ap-dropdown-link{
	display: inline-block;
	cursor: pointer;
	transition: .3s opacity ease;
	text-align: center;
	color: rgb(240, 240, 240);
	margin: 10px 0;
	font-size: 32px;
	text-decoration: none;
}
.ap-dropdown-link:nth-of-type(1){
	margin-top: 5px;
}
a:hover{
	opacity: 0.5;
	color: white;
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
	.ap-menu-title:first-of-type{
		margin-top: 100px;
	}
	.ap-dropdown-link{
		font-size: 32px;
		margin: 5px 0;
	}
	.ap-dropdown-link:hover{
		opacity: 1;
	}

	.ap-menu-title{
		font-size: 40px;
	}
	.ap-dropdown-title{
		font-size: 40px;
	}
	.ap-dropdown-link{
		font-size: 28px;
	}
	.DropDown{
		margin-bottom: 20px;
	}
}

/*MOBILE S*/
@media (width <= 360px){
    .ap-menu-title{
		font-size: 35px;
	}
	.ap-dropdown-title{
		font-size: 35px;
	}
	.ap-dropdown-link{
		font-size: 24px;
	}
	.DropDown{
		margin-bottom: 10px;
	}
}
</style>