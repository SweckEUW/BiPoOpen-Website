import { createRouter, createWebHistory } from 'vue-router'

const routes = [
	// Frontend
	{
		path: '/',
		name: 'Home',
		component: () => import('@/components/frontend/_Home.vue'),
		meta: {
			title: 'Weck BiPo Open',
			description: ''
		}
	},
	{
		path: '/Regeln',
		name: 'Regeln',
		component: () => import('@/components/frontend/_Rules.vue'),
		meta: {
			title: 'Weck BiPo Open - Regeln',
			description: 'Regeln'
		}
	},

	{
		path: '/Offene-Spiele',
		name: 'Offene Spiele',
		component: () => import('@/components/frontend/openGames/_OpenGames.vue'),
		meta: {
			title: 'Weck BiPo Open - Offene Spiele',
			description: 'Offene Spiel'
		}
	},

	{
		path: '/Hall-of-Fame',
		name: 'Hall Of Fame',
		component: () => import('@/components/frontend/_HallOfFame.vue'),
		meta: {
			title: 'Weck BiPo Open - Hall of Fame',
			description: 'Hall of Fame'
		}
	},

	{
		path: '/Teamanmeldung',
		name: 'Teamanmeldung',
		component: () => import('@/components/frontend/_Teamanmeldung.vue'),
		meta: {
			title: 'Weck BiPo Open 2024 - Teamanmeldung',
			description: 'Teamanmeldung'
		},
	},

	// Frontend - Tournament
	{
		path: '/:id',
		name: 'Tournament',
		component: () => import('@/components/frontend/tournament/_Tournament.vue'),
		meta: {
			title: 'Weck BiPo Open - REPLACE',
			description: 'Tournament'
		}
	},
	
	// Redirect
	{
		path: '/Spielplan',
		redirect: '/2024/Spielplan'
	},

	// Backend
	{
		path: '/Manage',
		name: 'Manage',
		component: () => import('@/components/backend/routes/_ManageTournaments.vue'),
		meta: {
			title: 'Weck BiPo Open REPLACE - Manage',
			description: ''
		}
	},
	{
		path: '/Manage/:id',
		name: 'ManageTournament',
		component: () => import('@/components/backend/routes/_ManageSingleTournament.vue'),
		meta: {
			title: 'Weck BiPo Open REPLACE - Manage',
			description: ''
		}
	},
	
	// 404
	{
		path: "/:catchAll(.*)",
		name: "NotFound404",
		component: () => import('@/components/frontend/_NotFound404.vue'),
		meta: {
			title: 'Weck BiPo Open - 404',
			description: '404 Seite nicht gefunden'
		}
	},

	{
		path: '/Impressum',
		name: 'Impressum',
		component: () => import('@/components/frontend/_Imprint.vue'),
		meta: {
			title: 'Weck BiPo Open - Impressum',
			description: 'Impressum'
		}
	},

	{
		path: '/Hall-of-Fame-SCW',
		name: 'Hall Of Fame SCW',
		component: () => import('@/components/frontend/_HallOfFameSCW.vue'),
		meta: {
			title: 'Weck BiPo Open - Hall of Fame SCW',
			description: 'Hall of Fame SCW'
		}
	}

];

const router = createRouter({
	history: createWebHistory(),
	routes: routes,
	scrollBehavior() {
		return { top: 0 }
	}
});

router.beforeEach((to, from, next) => {
	let title = (to.meta.title as string).replace("REPLACE", to.params.id as string)
	document.title = title;
	(document.querySelector("meta[property='og:title']")as HTMLMetaElement).content = title;
	
	let description = (to.meta.description as string).replace("REPLACE", to.params.id as string);
	(document.querySelector("meta[name=description]") as HTMLMetaElement).content = description;
	(document.querySelector("meta[property='og:description']")as HTMLMetaElement).content = description;

	next();
});

export default router;
