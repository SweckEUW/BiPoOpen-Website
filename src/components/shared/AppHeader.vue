<script setup lang="ts">
import { ref } from "vue"
import router from '../../router.js';

import DropDown from '@/components/shared/DropDown.vue';

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

let tournaments = ref(["2022", "2023", "2024"]);
</script>

<template>
	<div class="AppHeader">

		<div class="ap-left">
			<router-link to="/" @click="scrollToTop()">
				<img :src="logo" alt="">
			</router-link>
		</div>
		
		<div class="ap-right">
			<router-link to="/2023/Platzierungen">Platzierungen</router-link>
			<router-link to="/2023/Spielplan">Spielplan</router-link>
			<router-link to="/2023/MVP">Most Valuable Player</router-link>
			<router-link to="/2023/Fotos">Fotos</router-link>
		</div>

		<div class="ap-burger" @click="toggleBurgerMenu()">
			<div class="bar1"></div>
			<div class="bar2"></div>
			<div class="bar3"></div>
		</div>
		
		<transition name="fade" mode="out-in">
			<div class="ap-burger-menu" v v-show="showBurger">
				<div v-for="(tournament,i) in tournaments" :key="tournament">
					<DropDown :isOpen="tournament == '2023'" :style="{'marginTop' : i == 0 ? '150px' : '0px'}">
						<template #header>
							<h1>{{tournament}}</h1>
						</template>
						<template #content>
							<router-link @click="toggleBurgerMenu()" :to="'/' + tournament + '/Regeln'">Regeln</router-link>
							<router-link @click="toggleBurgerMenu()" :to="'/' + tournament + '/Spielplan'">Spielplan</router-link>
							<router-link @click="toggleBurgerMenu()" :to="'/' + tournament + '/Platzierungen'">Platzierungen</router-link>
							<router-link @click="toggleBurgerMenu()" :to="'/' + tournament + '/MVP'">Most Valuable Player</router-link>
							<router-link @click="toggleBurgerMenu()" :to="'/' + tournament + '/Fotos'">Fotos</router-link>
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
	padding-top: 50px;
	background: white;
}
.ap-left{
	float: left;
}
.ap-left a{
	display: flex;
	justify-content: center;
	align-items: center;
}
.ap-left img{
	width: 255px;
	height: 40px;
}
.ap-right{
	float: right;
}
.ap-right a{
	font-size: 20px;
}
.ap-burger{
	display: none;
}
.ap-burger-menu{
	display: none;
}
a{
	display: inline-block;
	cursor: pointer;
	transition: .3s opacity ease;
	text-align: center;
    color: var(--main-color);
	margin: 0;
	margin-bottom: 50px;
	margin: 0 15px;
	font-size: 24px;
	text-decoration: none;
}
a:first-child{
	margin-left: 0;
}
a:last-child{
	margin-right: 0;
}
a:hover{
	opacity: 0.7;
	color: var(--main-color) !important;
}

/*MOBILE*/
@media (width <= 900px){
	.AppHeader{
		padding-top: 20px;
		padding: 15px 5%;
	}
	a{
		font-size: 32px;
		margin: 0px !important;
		margin-bottom: 35px !important;
		color: rgb(240, 240, 240);
	}
	h1{
		color: white;
		font-size: 35px;
		font-weight: bolder;
		margin-bottom: 20px;
		text-align: center;
		display: inline-block;
	}
	.ap-left a{
		font-size: 20px;
		margin-top: 4px !important;
		margin-bottom: 0px !important;
	}
	.ap-left img{
		width: 180px;
		height: 30px;
	}
	.ap-left a:hover{
		opacity: 1;
		color: var(--main-color);;
	}
	.ap-right{
		display: none;
	}
	.ap-burger{
		display: block;
		float: right;
		position: absolute;
		right: 5%;
		z-index: 99;
		padding: 10px;
		padding-top: 5px;
	}
	.ap-burger-menu{
		width: 100vw;
		height: 100vh;
		position: absolute;
		z-index: 2;
		left: 0;
    	top: 0%;
		display: flex;
		align-items: center;
		flex-direction: column;
		background-color: var(--main-color);
		overflow: auto;
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
}
</style>