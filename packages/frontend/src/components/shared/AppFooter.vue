<template>
	<div class="AppFooter">

		<div class="af-socials">
			<!-- Instagram -->
			<a href="https://www.instagram.com/bipoopen" target="_blank">
				<img :src="instaIcon" titl="LinkedIn" alt="">
			</a>
		</div>
		
		<div class="af-imprint">
			<router-link to="/Impressum">Impressum</router-link>
		</div>
	</div>
</template>

<script setup lang="ts">
let instaIcon = new URL(`/src/assets/icons/instagram.png`, import.meta.url).href;
</script>

<style scoped>
.AppFooter{
	width: 100%; 
	background: var(--main-color);
	text-align: center;
	color: white;
	padding: 10px;
}

.af-socials{
	margin-bottom: 5px;
}
img{
	width: 30px;
	height: 30px;
	object-fit: contain;
	margin: 0px 12px;
	cursor: pointer;
	transition: .3s filter ease;
	filter: brightness(0%) invert(0.9);
}

.af-imprint a{
	cursor: pointer;
	color: white;
	text-decoration: none;
	transition: .3s color ease;
}
.af-imprint a:hover{
	color: rgb(211, 211, 211);
}

/*MOBILE*/
@media (width <= 900px){
	.af-imprint a{
		font-size: 13px;
	}
}
</style>