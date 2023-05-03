import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/components/home/_Home.vue'
import Plan from '@/components/plan/_Plan.vue'
import Poll from '@/components/poll/_Poll.vue'
import Manage from '@/components/manage/_Manage.vue'
import ManageTournament from '@/components/manage/tournament/_ManageTournament.vue'
import Teamanmeldung from '@/components/Teamanmeldung/_Teamanmeldung.vue'

const routes = [
	{
		path: '/',
		name: 'Home',
		component: Home,
		meta: {
			title: 'Weck BiPo Open 2023',
		},
	},

	{
		path: '/Umfrage',
		name: 'Umfrage',
		component: Poll,
		meta: {
			title: 'Weck BiPo Open 2023 - Umfrage',
		},
	},

	{
		path: '/Plan',
		name: 'Plan',
		component: Plan,
		meta: {
			title: 'Weck BiPo Open 2023 - Plan',
		},
	},

	{
		path: '/Teamanmeldung',
		name: 'Teamanmeldung',
		component: Teamanmeldung,
		meta: {
			title: 'Weck BiPo Open 2023 - Teamanmeldung',
		},
	},

	{
		path: '/Manage',
		name: 'Manage',
		component: Manage,
		meta: {
			title: 'Weck BiPo Open 2023 - Manage',
		},
	},

	{
		path: '/Manage/:id',
		name: 'ManageTournament',
		component: ManageTournament,
		meta: {
			title: 'Weck BiPo Open 2023 - Manage',
		},
	},
	
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
