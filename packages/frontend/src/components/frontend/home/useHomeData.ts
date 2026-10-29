import { ref } from 'vue';
import { getAllOpenGames } from '@/components/frontend/openGames/OpenGamesUtilFunctions';
import { getAllLeagueGames } from '@/components/frontend/league/LeagueUtilFunctions';
import { getLeagueCup } from '@/components/frontend/league/cup/LeagueCupUtilFunctions';
import { CURRENT_SEASON_SLUG, getSeason } from '@/components/frontend/league/LeagueSeasonsData';
import { getTournamentByName } from '@/util/tournamentFunctions';
import { LAST_TOURNAMENT_YEAR } from './homeUtil';

// Laedt alles fuer die Startseite einmal, Slider und "Zuletzt gespielt" teilen sich die Spiele.
export function useHomeData() {
    const openGames = ref<Match[]>([]);
    const leagueGames = ref<Match[]>([]);
    const leagueCup = ref<LeagueCup | null>(null);
    const lastTournament = ref<Tournament | null>(null);

    // Spiele fuer "Zuletzt gespielt" sind frueher da als alle Daten fuer den Slider.
    const gamesLoading = ref(true);
    const isLoading = ref(true);

    const loadGames = async () => {
        const [openResult, leagueResult] = await Promise.allSettled([getAllOpenGames(), getAllLeagueGames()]);
        if (openResult.status === 'fulfilled') openGames.value = openResult.value;
        if (leagueResult.status === 'fulfilled') leagueGames.value = leagueResult.value;
        gamesLoading.value = false;
    };

    const loadLeagueCup = async () => {
        if (!getSeason(CURRENT_SEASON_SLUG)?.hasCup) return;
        try {
            leagueCup.value = await getLeagueCup(CURRENT_SEASON_SLUG);
        } catch { /* Slider zeigt den Cup dann nicht */ }
    };

    const loadLastTournament = async () => {
        try {
            lastTournament.value = await getTournamentByName(LAST_TOURNAMENT_YEAR) ?? null;
        } catch { /* Slider zeigt das Turnier dann nicht */ }
    };

    Promise.all([loadGames(), loadLeagueCup(), loadLastTournament()])
        .then(() => isLoading.value = false);

    return { openGames, leagueGames, leagueCup, lastTournament, gamesLoading, isLoading };
}
