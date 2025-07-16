<template>
    <div class="ModifierMenue" @click="toggleBurgerMenu()" :class="{ change: showBurger }">
        <div class="bar1"></div>
        <div class="bar2"></div>
        <div class="bar3"></div>
    </div>

	<div class="mm-menu" v-show="showBurger">
		<div class="mm-menu-item" @click="">Airball</div>
		<div class="mm-menu-item">Bouncer</div>
		<div class="mm-menu-item">Trickshot</div>
		<div class="mm-menu-item">Deathcup</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

let showBurger = ref(false);

const toggleBurgerMenu = () =>{
	showBurger.value = !showBurger.value;
}
</script>

<style scoped>
.ModifierMenue{
    cursor: pointer;
    position: absolute;
	z-index: 99;
	padding: 10px;
	margin-left: auto;
    bottom: 10px;
    right: 10px;
}
.bar1, .bar2, .bar3 {
	width: 35px;
	height: 3px;
	background-color: var(--main-color);
	margin: 5px 0;
	transition: 0.4s;
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

.mm-menu{
	position: absolute;
	background-color: white;
	bottom: 60px;
	right: 0px;
	padding: 10px;
}
.mm-menu-item{
	cursor: pointer;
	font-size: 22px;
	padding: 5px;
	margin: 5px 0;
}
</style>