import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/components/home/_Home.vue'
import Poll from '@/components/poll/_Poll.vue'
import ManageTournaments from '@/components/manageTournaments/_ManageTournaments.vue'
import ManageSingleTournament from '@/components/manageSingleTournament/_ManageSingleTournament.vue'
import Schedule from '@/components/schedule/_Schedule.vue'
import Standings from '@/components/standings/_Standings.vue'
import MVP from '@/components/mvp/_MVP.vue'
// import Teamanmeldung from '@/components/teamanmeldung/_Teamanmeldung.vue'

const routes = [
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

	{
		path: '/Zeitplan',
		name: 'Schedule',
		component: Schedule,
		meta: {
			title: 'Weck BiPo Open 2023 - Zeitplan',
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
	}

	// {
	// 	path: '/Teamanmeldung',
	// 	name: 'Teamanmeldung',
	// 	component: Teamanmeldung,
	// 	meta: {
	// 		title: 'Weck BiPo Open 2023 - Teamanmeldung',
	// 	},
	// },
	
];

const router = createRouter({
	history: createWebHistory(),
	routes
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
