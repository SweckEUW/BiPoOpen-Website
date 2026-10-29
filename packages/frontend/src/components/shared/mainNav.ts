import type { RouteLocationNormalizedLoaded } from 'vue-router';

export type MainNavItem = {
	label: string;
	icon: string; // image url
	to?: string; // undefined = opens tournament picker
};

export const MAIN_NAV_ITEMS: MainNavItem[] = [
	{ label: 'BiPo League', icon: new URL('/src/assets/icons/nav/league.webp', import.meta.url).href, to: '/League' },
	{ label: 'BiPo Open', icon: new URL('/src/assets/icons/nav/turnier.webp', import.meta.url).href },
	{ label: 'Offene Spiele', icon: new URL('/src/assets/icons/nav/offene-spiele.webp', import.meta.url).href, to: '/Offene-Spiele' },
	{ label: 'Weltrangliste', icon: new URL('/src/assets/icons/nav/weltrangliste.webp', import.meta.url).href, to: '/Weltrangliste' },
	{ label: 'Regeln', icon: new URL('/src/assets/icons/nav/regeln.webp', import.meta.url).href, to: '/Regeln' },
];

export const isMainNavItemActive = (item: MainNavItem, route: RouteLocationNormalizedLoaded, pickerOpen: boolean) => {
	if (!item.to)
		return pickerOpen || route.name === 'Tournament';
	if (pickerOpen)
		return false;
	return route.path.toLowerCase().startsWith(item.to.toLowerCase());
};
