import { createRouter, createWebHistory } from 'vue-router'

const routes = [
	// Frontend
	{
		path: '/',
		name: 'Home',
		component: () => import('@/components/frontend/routes/_Home.vue'),
		meta: {
			title: 'Weck BiPo Open',
		}
	},
	{
		path: '/Umfrage',
		name: 'Umfrage',
		component: () => import('@/components/frontend/routes/_Poll.vue'),
		meta: {
			title: 'Weck BiPo Open REPLACE - Umfrage',
		}
	},
	{
		path: '/Regeln',
		name: 'Regeln',
		component: () => import('@/components/frontend/routes/_Rules.vue'),
		meta: {
			title: 'Weck BiPo Open REPLACE - Regeln',
		}
	},
	// {
	// 	path: '/Teamanmeldung',
	// 	name: 'Teamanmeldung',
	// 	component: () => import('@/components/teamanmeldung/_Teamanmeldung.vue'),
	// 	meta: {
	// 		title: 'Weck BiPo Open REPLACE - Teamanmeldung',
	// 	},
	// },

	// Frontend - Tournament
	{
		path: '/:id/Spielplan',
		name: 'Schedule',
		component: () => import('@/components/frontend/routes/tournament/_Schedule.vue'),
		meta: {
			title: 'Weck BiPo Open REPLACE - Spielplan',
		}
	},
	{
		path: '/:id/Platzierungen',
		name: 'Standings',
		component: () => import('@/components/frontend/routes/tournament/_Standings.vue'),
		meta: {
			title: 'Weck BiPo Open REPLACE - Platzierungen',
		}
	},
	{
		path: '/:id/MVP',
		name: 'MVP',
		component: () => import('@/components/frontend/routes/tournament/_MVP.vue'),
		meta: {
			title: 'Weck BiPo Open REPLACE - MVP',
		}
	},
	{
		path: '/:id/Spielplan-Übersicht',
		name: 'ScheduleOverview',
		component: () => import('@/components/frontend/routes/tournament/_ScheduleOverview.vue'),
		meta: {
			title: 'Weck BiPo Open REPLACE - Spielplan-Übersicht',
		}
	},
	{
		path: '/:id/Zusammenfassung',
		name: 'Summary',
		component: () => import('@/components/frontend/routes/tournament/_Summary.vue'),
		meta: {
			title: 'Weck BiPo Open REPLACE - Zusammenfassung',
		}
	},
	{
		path: '/:id/Fotos',
		name: 'Photos',
		component: () => import('@/components/frontend/routes/tournament/_Photos.vue'),
		meta: {
			title: 'Weck BiPo Open REPLACE - Fotos',
		}
	},

	// Redirect
	{
		path: '/Spielplan',
		redirect: '/2023/Spielplan'
	},

	// Backend
	{
		path: '/Manage',
		name: 'Manage',
		component: () => import('@/components/backend/routes/_ManageTournaments.vue'),
		meta: {
			title: 'Weck BiPo Open REPLACE - Manage',
		}
	},
	{
		path: '/Manage/:id',
		name: 'ManageTournament',
		component: () => import('@/components/backend/routes/_ManageSingleTournament.vue'),
		meta: {
			title: 'Weck BiPo Open REPLACE - Manage',
		}
	},
	
	// 404
	{
		path: "/:catchAll(.*)",
		name: "NotFound404",
		component: () => import('@/components/frontend/routes/_NotFound404.vue'),
		meta: {
			title: 'Weck BiPo Open - 404',
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
	// @ts-ignore 
	document.title = to.meta.title;

	if(document.title.includes("REPLACE")){
		// @ts-ignore 
		document.title = document.title.replace("REPLACE", to.params.id);
	}
		
	next();
});

export default router;
