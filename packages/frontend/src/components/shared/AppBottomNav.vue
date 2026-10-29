<template>
	<nav class="AppBottomNav">
		<component
			v-for="item in MAIN_NAV_ITEMS"
			:key="item.label"
			:is="item.to ? 'router-link' : 'button'"
			:to="item.to"
			:type="item.to ? undefined : 'button'"
			class="bn-item"
			:class="{ 'bn-item-active': isMainNavItemActive(item, route, tournamentPickerVisible) }"
			@click="onItemClick(item)"
		>
			<img :src="item.icon" alt="" class="bn-icon">
			<span class="bn-label">{{ item.label }}</span>
		</component>
	</nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { MAIN_NAV_ITEMS, MainNavItem, isMainNavItemActive } from './mainNav';
import { useTournamentPicker } from './useTournamentPicker';

const route = useRoute();
const { tournamentPickerVisible, openTournamentPicker, closeTournamentPicker } = useTournamentPicker();

const onItemClick = (item: MainNavItem) => {
	if (item.to)
		closeTournamentPicker();
	else
		openTournamentPicker();
};
</script>

<style scoped>
.AppBottomNav {
	display: none;
}

@media (width <= 900px) {
	.AppBottomNav {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 99;
		display: flex;
		height: calc(var(--app-bottom-nav-height) + env(safe-area-inset-bottom));
		padding-bottom: env(safe-area-inset-bottom);
		background: white;
		border-top: 1px solid #dcdfe4;
		box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.12);
	}
}

.bn-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0;
	background: none;
	border: none;
	padding: 0;
	color: #666;
	text-decoration: none;
	-webkit-tap-highlight-color: transparent;
}
.bn-icon {
	width: 38px;
	height: 38px;
	object-fit: contain;
	filter: grayscale(1) contrast(1.3) brightness(.85);
	opacity: .8;
	transition: filter .2s ease, opacity .2s ease;
}
.bn-label {
	font-size: 11px;
	line-height: 1.2;
	white-space: nowrap;
}
.bn-item-active {
	color: var(--main-color);
}
.bn-item-active .bn-icon {
	filter: grayscale(0) contrast(1) brightness(1);
	opacity: 1;
}
</style>
