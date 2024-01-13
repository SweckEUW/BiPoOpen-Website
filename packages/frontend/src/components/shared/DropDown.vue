<script setup lang="ts">
import { ref } from "vue"

const props = defineProps(['isOpen', "name"])

let menuOpen = ref(props.isOpen);

const toggleMenu = () =>{
	menuOpen.value = !menuOpen.value;
	window.dispatchEvent(new CustomEvent("closeAllDropDowns", {detail: { name: props.name }}));
}

window.addEventListener("closeAllDropDowns", (e:any) => {
	if(e.detail && e.detail.name != props.name)
		menuOpen.value = false;
})
</script>

<template>
	<div class="DropDown" :style="{'maxHeight': menuOpen ? '450px' : '60px'}">

		<div class="dd-title" @click="toggleMenu()">
			<div class="arrow-down" :style="{'transform': menuOpen ? 'rotate(0deg)' : 'rotate(-90deg)'}"></div>
			<slot name="header"></slot>
		</div>
		<div class="dd-content">
			<slot name="content"></slot>
		</div>

	</div>
</template>

<style scoped>
.DropDown{
	overflow: hidden;
	transition: max-height .5s ease;
	margin-bottom: 30px;
}
.dd-title{
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: .3s opacity ease;
}
.dd-title:hover{
	opacity: 0.5;
}
.dd-content{
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
}
.arrow-down{
	width: 0; 
	height: 0; 
	border-left: 10px solid transparent;
	border-right: 10px solid transparent;
	display: inline-block;
	border-top: 10px solid white;
	margin-right: 10px;
	transition: transform .5s ease;
}

/*MOBILE*/
@media (width <= 900px){
	.dd-title:hover{
		opacity: 1;
	}
}
</style>