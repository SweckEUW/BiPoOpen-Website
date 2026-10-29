import { ref } from 'vue';

// Shared state so header (desktop) and bottom nav (mobile) open the same drawer
const tournamentPickerVisible = ref(false);

export const useTournamentPicker = () => {
	const openTournamentPicker = () => { tournamentPickerVisible.value = true; };
	const closeTournamentPicker = () => { tournamentPickerVisible.value = false; };

	return { tournamentPickerVisible, openTournamentPicker, closeTournamentPicker };
};
