<template>
	<div class="AppFooter">

		<!-- PWA install -->
		<button
			v-if="canInstall && !isInstalled"
			type="button"
			class="af-install-btn"
			@click="installPwa"
		>
			<i class="pi pi-download"></i>
			App installieren
		</button>

		<!-- Instagram -->
		<a class="af-insta" href="https://www.instagram.com/bipoopen" target="_blank">
			<i class="pi pi-instagram"></i>
			@bipoopen
		</a>

		<router-link class="af-imprint" to="/Impressum">Impressum</router-link>
	</div>
</template>

<script setup lang="ts">
import { usePwaInstall } from './usePwaInstall';

const { canInstall, isInstalled, installPwa } = usePwaInstall();
</script>

<style scoped>
.AppFooter{
	width: 90%;
	max-width: 600px;
	margin: 0 auto;
	padding: 24px 0 30px;
	border-top: 1px solid #e5e5e5;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 18px;
}

.af-install-btn{
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
	padding: 12px;
	background: white;
	border: 1px solid var(--main-color);
	border-radius: 12px;
	color: var(--main-color);
	font-weight: 700;
	font-size: 15px;
	transition: .2s background ease;
}
.af-install-btn:hover{
	background: rgba(234, 81, 96, 0.06);
}

.af-insta{
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 16px;
	background: white;
	border: 1px solid #eee;
	border-radius: 999px;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
	color: #222;
	font-weight: 600;
	font-size: 14px;
	text-decoration: none;
	transition: .2s border-color ease;
}
.af-insta i{
	font-size: 17px;
}
.af-insta:hover{
	color: #222;
	border-color: #ccc;
}

.af-imprint{
	color: #777;
	font-size: 13px;
	text-decoration: none;
}
.af-imprint:hover{
	color: var(--main-color);
}

/*MOBILE*/
@media (width <= 900px){
	.AppFooter{
		width: 95%;
	}
}
</style>
