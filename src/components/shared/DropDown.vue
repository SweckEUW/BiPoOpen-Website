<script setup lang="ts">
import { ref } from "vue"

const props = defineProps(['isOpen'])

let menuOpen = ref(props.isOpen);

const toggleMenu = () =>{
	menuOpen.value = !menuOpen.value;
}
</script>

<template>
	<div class="DropDown" :style="{'maxHeight': menuOpen ? '500px' : '60px'}">

		<div @click="toggleMenu()">
			<slot name="header"></slot>
			<div class="arrow-down" :style="{'transform': menuOpen ? '' : 'rotate(180deg)'}"></div>
		</div>
		<div class="dd-content">
			<slot name="content"></slot>
		</div>

	</div>
</template>

<style scoped>
.DropDown{
	overflow: hidden;
	transition: max-height .3s ease;
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
	margin-left: 10px;
	margin-bottom: 10px;
	transition: transform .3s ease;
}
</style>