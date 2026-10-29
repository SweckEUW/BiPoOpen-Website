import { ref } from 'vue';

type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const canInstall = ref(false);
const isInstalled = ref(false);
const isIos = ref(false);

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let initialized = false;

const init = () => {
	if (initialized) return;
	initialized = true;

	const legacyNavigator = window.navigator as Navigator & { standalone?: boolean };
	isInstalled.value = window.matchMedia('(display-mode: standalone)').matches || legacyNavigator.standalone === true;

	// iOS unterstützt kein beforeinstallprompt – gesondert erkennen
	isIos.value = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
	if (isIos.value && !isInstalled.value) {
		canInstall.value = true;
	}

	window.addEventListener('beforeinstallprompt', (event: Event) => {
		event.preventDefault();
		deferredPrompt = event as BeforeInstallPromptEvent;
		canInstall.value = true;
	});

	window.addEventListener('appinstalled', () => {
		deferredPrompt = null;
		canInstall.value = false;
		isInstalled.value = true;
	});
};

const installPwa = async () => {
	if (deferredPrompt) {
		// Chromium: nativer Install-Dialog. Prompt kann nicht erneut ausgelöst werden – Button danach ausblenden
		await deferredPrompt.prompt();
		await deferredPrompt.userChoice;
		deferredPrompt = null;
		canInstall.value = false;
	} else if (isIos.value) {
		// iOS Safari: manuelle Anleitung
		alert('Tippe unten auf das Teilen-Symbol (↑) und wähle dann „Zum Home-Bildschirm" aus.');
	}
};

export const usePwaInstall = () => {
	init();
	return { canInstall, isInstalled, installPwa };
};
