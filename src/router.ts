import { createRouter, createWebHistory } from 'vue-router'
import Home from './components/home/_Home.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
	{
		path: '/',
		name: 'Home',
		component: Home,
		meta: {
			title: 'Weck BiPo Open 2023',
		},
	},

	// {
	// 	path: '/',
	// 	name: 'Home',
	// 	component: () => import(/* webpackChunkName: "Home" */ './components/home/_Home.vue'),
	// 	meta: {
	// 		title: 'Weck BiPo Open 2023',
	// 	},
	// },

  ],
})
