<template>
	<div class="AppFooter">

		<div class="af-socials">
			<!-- Instagram -->
			<a href="https://www.instagram.com/bipoopen" target="_blank">
				<img :src="instaIcon" alt="Instagram">
			</a>
		</div>

		<div class="af-bottom">
			<button
				v-if="canInstall && !isInstalled"
				type="button"
				class="af-install-btn"
				@click="installPwa"
			>
				App installieren
			</button>
			<router-link to="/Impressum">Impressum</router-link>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

let instaIcon = new URL(`/src/assets/icons/instagram.png`, import.meta.url).href;

type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const canInstall = ref(false);
const isInstalled = ref(false);
const isIos = ref(false);

let deferredPrompt: BeforeInstallPromptEvent | null = null;

const checkInstalledState = () => {
	const legacyNavigator = window.navigator as Navigator & { standalone?: boolean };
	isInstalled.value = window.matchMedia('(display-mode: standalone)').matches || legacyNavigator.standalone === true;
};

const handleBeforeInstallPrompt = (event: Event) => {
	event.preventDefault();
	deferredPrompt = event as BeforeInstallPromptEvent;
	canInstall.value = true;
};

const handleAppInstalled = () => {
	deferredPrompt = null;
	canInstall.value = false;
	isInstalled.value = true;
};

const installPwa = async () => {
	if (deferredPrompt) {
		// Chromium: nativer Install-Dialog
		await deferredPrompt.prompt();
		const result = await deferredPrompt.userChoice;
		deferredPrompt = null;
		canInstall.value = false;
		if (result.outcome !== 'accepted') {
			// Prompt kann nicht erneut ausgelöst werden – Button ausblenden
		}
	} else if (isIos.value) {
		// iOS Safari: manuelle Anleitung
		alert('Tippe unten auf das Teilen-Symbol (↑) und wähle dann „Zum Home-Bildschirm" aus.');
	}
};

onMounted(() => {
	checkInstalledState();
	// iOS unterstützt kein beforeinstallprompt – gesondert erkennen
	const ua = navigator.userAgent.toLowerCase();
	isIos.value = /iphone|ipad|ipod/.test(ua);
	if (isIos.value && !isInstalled.value) {
		canInstall.value = true;
	}
	window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
	window.addEventListener('appinstalled', handleAppInstalled);
});

onBeforeUnmount(() => {
	window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
	window.removeEventListener('appinstalled', handleAppInstalled);
});
</script>

<style scoped>
.AppFooter{
	width: 100%; 
	min-height: 80px;
	background: var(--main-color);
	text-align: center;
	color: white;
	padding: 10px;
}

.af-socials{
	margin-bottom: 5px;
}

.af-socials a{
	display: flex;
	justify-content: center;
}

img{
	width: 25px;
	height: 25px;
	object-fit: contain;
	margin: 0px 12px;
	cursor: pointer;
	transition: .3s filter ease;
	filter: brightness(0%) invert(0.9);
}

.af-bottom{
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12px;
}

.af-install-btn{
	background: white;
	color: var(--main-color);
	border: 1px solid transparent;
	border-radius: 999px;
	padding: 5px 12px;
	font-size: 13px;
	font-weight: 600;
	line-height: 1.2;
	transition: .2s ease;
}

.af-install-btn:hover{
	background: rgb(245, 245, 245);
}

.af-bottom a{
	cursor: pointer;
	color: white;
	text-decoration: none;
	transition: .3s color ease;
}
.af-bottom a:hover{
	color: rgb(211, 211, 211);
}

/*MOBILE*/
@media (width <= 900px){
	.af-install-btn,
	.af-bottom a{
		font-size: 12px;
	}
}
</style>