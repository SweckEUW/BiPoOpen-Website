import { createRouter, createWebHistory } from 'vue-router'

const routes = [
	// Frontend
	{
		path: '/',
		name: 'Home',
		component: () => import('@/components/frontend/routes/_Home.vue'),
		meta: {
			title: 'Weck BiPo Open',
			description: ''
		}
	},
	{
		path: '/Regeln',
		name: 'Regeln',
		component: () => import('@/components/frontend/routes/_Rules.vue'),
		meta: {
			title: 'Weck BiPo Open - Regeln',
			description: 'Regeln'
		}
	},

	{
		path: '/Offene-Spiele',
		name: 'Offene Spiele',
		component: () => import('@/components/frontend/routes/openGames/_OpenGames.vue'),
		meta: {
			title: 'Weck BiPo Open - Offene Spiele',
			description: 'Offene Spiel'
		}
	},

	{
		path: '/Hall-of-Fame',
		name: 'Hall Of Fame',
		component: () => import('@/components/frontend/routes/_HallOfFame.vue'),
		meta: {
			title: 'Weck BiPo Open - Hall of Fame',
			description: 'Hall of Fame'
		}
	},

	{
		path: '/Teamanmeldung',
		name: 'Teamanmeldung',
		component: () => import('@/components/frontend/routes/_Teamanmeldung.vue'),
		meta: {
			title: 'Weck BiPo Open 2024 - Teamanmeldung',
			description: 'Teamanmeldung'
		},
	},

	// Frontend - Tournament
	{
		path: '/:id/Spielplan',
		name: 'Schedule',
		component: () => import('@/components/frontend/routes/tournament/schedule/_Schedule.vue'),
		meta: {
			title: 'Weck BiPo Open REPLACE - Spielplan',
			description: 'Spielplan'
		}
	},
	{
		path: '/:id/Platzierungen',
		name: 'Standings',
		component: () => import('@/components/frontend/routes/tournament/standings/_Standings.vue'),
		meta: {
			title: 'Weck BiPo Open REPLACE - Platzierungen',
			description: 'Platzierungen'
		}
	},
	{
		path: '/:id/MVP',
		name: 'MVP',
		component: () => import('@/components/frontend/routes/tournament/_MVP.vue'),
		meta: {
			title: 'Weck BiPo Open REPLACE - MVP',
			description: 'Most Valuable Player'
		}
	},
	{
		path: '/:id/Spielplan2',
		name: 'ScheduleOverview',
		component: () => import('@/components/frontend/routes/tournament/_ScheduleOverview.vue'),
		meta: {
			title: 'Weck BiPo Open REPLACE - Spielplan-Übersicht',
			description: 'Spielplan-Übersicht'
		}
	},
	{
		path: '/:id/Zusammenfassung',
		name: 'Summary',
		component: () => import('@/components/frontend/routes/tournament/_Summary.vue'),
		meta: {
			title: 'Weck BiPo Open REPLACE - Zusammenfassung',
			description: 'Zusammenfassung'
		}
	},
	{
		path: '/:id/Fotos',
		name: 'Photos',
		component: () => import('@/components/frontend/routes/tournament/_Photos.vue'),
		meta: {
			title: 'Weck BiPo Open REPLACE - Fotos',
			description: 'Fotos'
		}
	},
	{
		path: '/:id/Teams',
		name: 'Teams',
		component: () => import('@/components/frontend/routes/tournament/_Teams.vue'),
		meta: {
			title: 'Weck BiPo Open REPLACE - Teams',
			description: 'Teams'
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
		component: () => import('@/components/frontend/routes/_NotFound404.vue'),
		meta: {
			title: 'Weck BiPo Open - 404',
			description: '404 Seite nicht gefunden'
		}
	},

	{
		path: '/Impressum',
		name: 'Impressum',
		component: () => import('@/components/frontend/routes/_Imprint.vue'),
		meta: {
			title: 'Weck BiPo Open - Impressum',
			description: 'Impressum'
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

router.beforeResolve((to, from, next) => {
	let title = (to.meta.title as string).replace("REPLACE", to.params.id as string)
	document.title = title;
	(document.querySelector("meta[property='og:title']")as HTMLMetaElement).content = title;
	
	let description = (to.meta.description as string).replace("REPLACE", to.params.id as string);
	(document.querySelector("meta[name=description]") as HTMLMetaElement).content = description;
	(document.querySelector("meta[property='og:description']")as HTMLMetaElement).content = description;

	next();
});

export default router;
