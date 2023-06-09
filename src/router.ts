import { createRouter, createWebHistory } from 'vue-router'

// Frontend
import Home from '@/components/frontend/routes/_Home.vue'
import Poll from '@/components/frontend/routes/_Poll.vue'
import Schedule from '@/components/frontend/routes/_Schedule.vue'
import ScheduleOverview from '@/components/frontend/routes/_ScheduleOverview.vue'
import Standings from '@/components/frontend/routes/_Standings.vue'
import MVP from '@/components/frontend/routes/_MVP.vue'
import Rules from '@/components/frontend/routes/_Rules.vue'
import Photos from '@/components/frontend/routes/_Photos.vue'
// import Teamanmeldung from '@/components/teamanmeldung/_Teamanmeldung.vue'

// Backend
import ManageTournaments from '@/components/backend/routes/_ManageTournaments.vue'
import ManageSingleTournament from '@/components/backend/routes/_ManageSingleTournament.vue'

const routes = [
	// Frontend
	{
		path: '/',
		name: 'Home',
		component: Home,
		meta: {
			title: 'Weck BiPo Open 2023',
		}
	},
	{
		path: '/Umfrage',
		name: 'Umfrage',
		component: Poll,
		meta: {
			title: 'Weck BiPo Open 2023 - Umfrage',
		}
	},
	{
		path: '/Spielplan',
		name: 'Schedule',
		component: Schedule,
		meta: {
			title: 'Weck BiPo Open 2023 - Spielplan',
		}
	},
	{
		path: '/Platzierungen',
		name: 'Standings',
		component: Standings,
		meta: {
			title: 'Weck BiPo Open 2023 - Platzierungen',
		}
	},
	{
		path: '/MVP',
		name: 'MVP',
		component: MVP,
		meta: {
			title: 'Weck BiPo Open 2023 - MVP',
		}
	},
	{
		path: '/Regeln',
		name: 'Regeln',
		component: Rules,
		meta: {
			title: 'Weck BiPo Open 2023 - Regeln',
		}
	},
	{
		path: '/Spielplan2',
		name: 'ScheduleOverview',
		component: ScheduleOverview,
		meta: {
			title: 'Weck BiPo Open 2023 - Spielplan-Übersicht',
		}
	},
	{
		path: '/2023/Fotos',
		name: 'Photos',
		component: Photos,
		meta: {
			title: 'Weck BiPo Open 2023 - Fotos',
		}
	},
	// {
	// 	path: '/Teamanmeldung',
	// 	name: 'Teamanmeldung',
	// 	component: Teamanmeldung,
	// 	meta: {
	// 		title: 'Weck BiPo Open 2023 - Teamanmeldung',
	// 	},
	// },

	// Backend
	{
		path: '/Manage',
		name: 'Manage',
		component: ManageTournaments,
		meta: {
			title: 'Weck BiPo Open 2023 - Manage',
		}
	},
	{
		path: '/Manage/:id',
		name: 'ManageTournament',
		component: ManageSingleTournament,
		meta: {
			title: 'Weck BiPo Open 2023 - Manage',
		}
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes: routes,
	scrollBehavior() {
		return { top: 0 }
	}
});

router.beforeEach((to, from, next) => {
	// This goes through the matched routes from last to first, finding the closest route with a title.
	// e.g., if we have `/some/deep/nested/route` and `/some`, `/deep`, and `/nested` have titles,
	// `/nested`'s will be chosen.
	const nearestWithTitle = to.matched
		.slice()
		.reverse()
		.find((r) => r.meta && r.meta.title);

	// Find the nearest route element with meta tags.
	const nearestWithMeta = to.matched
		.slice()
		.reverse()
		.find((r) => r.meta && r.meta.metaTags);

	const previousNearestWithMeta = from.matched
		.slice()
		.reverse()
		.find((r) => r.meta && r.meta.metaTags);

	// If a route with a title was found, set the document (page) title to that value.
	if (nearestWithTitle) {
		(document as any).title = nearestWithTitle.meta.title;
	} else if (previousNearestWithMeta) {
		(document as any).title = previousNearestWithMeta.meta.title;
	}

	// Remove any stale meta tags from the document using the key attribute we set below.
	Array.from(
		document.querySelectorAll('[data-vue-router-controlled]')
	).map((el:any) => el.parentNode.removeChild(el));

	// Skip rendering meta tags if there are none.
	if (!nearestWithMeta) return next();

	// Turn the meta tag definitions into actual elements in the head.
	(nearestWithMeta as any).meta.metaTags
		.map((tagDef:any) => {
			const tag = document.createElement('meta');

			Object.keys(tagDef).forEach((key) => {
				tag.setAttribute(key, tagDef[key]);
			});

			// We use this to track which meta tags we create so we don't interfere with other ones.
			tag.setAttribute('data-vue-router-controlled', '');

			return tag;
		})
		// Add the meta tags to the document head.
		.forEach((tag:any) => document.head.appendChild(tag));

	next();
});

export default router;
