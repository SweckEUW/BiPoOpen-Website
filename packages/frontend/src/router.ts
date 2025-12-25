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
		path: '/BiPo-Knecht',
		name: 'BiPo-Knecht',
		component: () => import('@/components/frontend/biPoKnecht/_BiPoKnecht.vue'),
		meta: {
			title: 'Weck BiPo Open Knecht',
			description: 'BiPo Knecht'
		}
	},


	{
		path: '/BiPo-League',
		name: 'BiPo-League',
		component: () => import('@/components/frontend/league/_League.vue'),
		meta: {
			title: 'Weck BiPo League',
			description: 'BiPo League'
		}
	},

	{
		path: '/League',
		name: 'BiPo League',
		component: () => import('@/components/frontend/league/_League.vue'),
		meta: {
			title: 'Weck BiPo League',
			description: 'BiPo League'
		}
	},

	

	{
		path: '/2025/Anmeldung',
		name: 'Teamanmeldung',
		component: () => import('@/components/frontend/_Teamanmeldung.vue'),
		meta: {
			title: 'Weck BiPo Open 2025 - Anmeldung',
			description: 'Anmeldung'
		},
	},

	// Frontend - Tournament
	{
		path: '/:TournamentName',
		name: 'Tournament',
		component: () => import('@/components/frontend/tournament/_Tournament.vue'),
		children: [
			{
				path: 'Teams',
				component: () => import('@/components/frontend/tournament/_Tournament.vue'),
				meta: {
					title: 'Weck BiPo Open - REPLACE - Teams',
					description: 'Tournament'
				}
			},
			{
				path: 'MVP',
				component: () => import('@/components/frontend/tournament/_Tournament.vue'),
				meta: {
					title: 'Weck BiPo Open - REPLACE - MVP',
					description: 'Tournament'
				}
			},
			{
				path: 'Spielplan',
				component: () => import('@/components/frontend/tournament/_Tournament.vue'),
				meta: {
					title: 'Weck BiPo Open - REPLACE - Spielplan',
					description: 'Tournament'
				}
			},
			{
				path: 'Fotos',
				component: () => import('@/components/frontend/tournament/_Tournament.vue'),
				meta: {
					title: 'Weck BiPo Open - REPLACE - Fotos',
					description: 'Tournament'
				}
			}
		],
		meta: {
			title: 'Weck BiPo Open - REPLACE',
			description: 'Tournament'
		}
	},
	
	// Redirect
	{
		path: '/Spielplan',
		redirect: '/2025/Spielplan'
	},

	/////////////
	// Backend //
	/////////////
	{
		path: '/Manage',
		name: 'Manage',
		component: () => import('@/components/backend/routes/_Manage.vue'),
		meta: {
			title: 'Weck BiPo Open - Backend',
			description: ''
		}
	},
	{
		path: '/Manage/Tournaments',
		name: 'Manage Tournaments',
		component: () => import('@/components/backend/routes/_ManageTournaments.vue'),
		meta: {
			title: 'Weck BiPo Open - Tournaments Backend',
			description: ''
		}
	},
	{
		path: '/Manage/Tournaments/:TournamentName',
		name: 'Manage Tournament',
		component: () => import('@/components/backend/routes/_ManageSingleTournament.vue'),
		meta: {
			title: 'Weck BiPo Open REPLACE - Backend',
			description: ''
		}
	},
	{
		path: '/Manage/OpenGames',
		name: 'Manage Open Games',
		component: () => import('@/components/backend/routes/_ManageOpenGames.vue'),
		meta: {
			title: 'Weck BiPo Open - Manage Open Games',
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
	let title = (to.meta.title as string).replace("REPLACE", to.params.TournamentName as string)
	document.title = title;
	(document.querySelector("meta[property='og:title']")as HTMLMetaElement).content = title;
	
	let description = (to.meta.description as string).replace("REPLACE", to.params.TournamentName as string);
	(document.querySelector("meta[name=description]") as HTMLMetaElement).content = description;
	(document.querySelector("meta[property='og:description']")as HTMLMetaElement).content = description;

	next();
});

export default router;
