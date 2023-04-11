<script setup lang="ts">
import { ref } from "vue"
import { Router } from "vue-router";
import router from '../../router.js';

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
</script>

<template>
	<div class="AppHeader">

		<router-link to="/" @click="scrollToTop()">Weck BiPo Open 2023</router-link>

		<!-- <div class="ap-left">
			<router-link to="/" @click="scrollToTop()">[Simon Weck]</router-link>
		</div>
		
		<div class="ap-right">
			<router-link to="/Work">[Work]</router-link>
			<router-link to="/About">[About Me]</router-link>
			<router-link to="/Contact">[Contact]</router-link>
		</div>

		<div class="ap-burger" @click="toggleBurgerMenu()">
			<div class="bar1"></div>
			<div class="bar2"></div>
			<div class="bar3"></div>
		</div>
		
		<transition name="fade" mode="out-in">
			<div class="ap-burger-menu" v v-show="showBurger">
				<div class="ap-burger" @click="toggleBurgerMenu()"/>
				<router-link @click="toggleBurgerMenu()" to="/Work">[Work]</router-link>
				<router-link @click="toggleBurgerMenu()" to="/About">[About Me]</router-link>
				<router-link @click="toggleBurgerMenu()" to="/Contact">[Contact]</router-link>
			</div>
		</transition> -->

	</div>
</template>

<style scoped>
.AppHeader{
	width: 90%;
	z-index: 99;
	padding: 20px 0px;
	position: fixed;
	top: 30px;
	filter: drop-shadow(0px 0px 100px rgba(255, 255, 255, 0.295));
	margin: 0 5%;
}
.ap-left{
	float: left;
}
.ap-right{
	float: right;
}
.ap-burger{
	display: none;
}
.ap-burger-menu{
	display: none;
}
/* a{
	display: inline-block;
	cursor: pointer;
	transition: .3s color ease;
	text-align: center;
    color: white;
    text-shadow: 0px 0px 10px rgba(0,0,0,0.6), 0px 0px 5px rgba(0,0,0,0.6);
	margin: 0;
	margin-bottom: 50px;
	margin: 0 15px;
	font-size: 1.5vw;
}
a:first-child{
	margin-left: 0;
}
a:last-child{
	margin-right: 0;
}
a:hover{
	color: rgb(160, 160, 160);
} */
/*MOBILE*/
@media (width <= 900px){
	.AppHeader{
		top: 4px;
	}
	/* a{
		font-size: 28px;
		margin: 0px !important;
		margin-bottom: 40px !important;
	} */
	.ap-right{
		display: none;
	}
	.ap-burger{
		display: block;
		float: right;
		position: absolute;
		right: 0;
		z-index: 99;
	}
	.ap-burger-menu{
		display: block;
		width: 100vw;
		height: 100vh;
		position: absolute;
		z-index: 2;
		left: -20px;
    	top: -5px;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		background-color: rgba(0, 0, 0, 0.9);
	}
	.bar1, .bar2, .bar3 {
		width: 35px;
		height: 4px;
		background-color: #ffffff;
		filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.6)) drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.3));
		margin: 6px 0;
		transition: 0.4s;
		border-radius: 5px;
	}
	.change .bar1 {
		transform: translate(0, 10px) rotate(-45deg);
	}
	.change .bar2 {
		opacity: 0;
	}
	.change .bar3 {
		transform: translate(0, -10px) rotate(45deg);
	}
}
</style>