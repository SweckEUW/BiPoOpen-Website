import { ref, shallowRef } from 'vue';
import { getAllOpenGames } from '@/components/frontend/openGames/OpenGamesUtilFunctions';
import { getAllLeagueGames } from '@/components/frontend/league/LeagueUtilFunctions';
import { getLeagueCup } from '@/components/frontend/league/cup/LeagueCupUtilFunctions';
import { LEAGUE_SEASONS } from '@/components/frontend/league/LeagueSeasonsData';
import { getTournamentByName } from '@/util/tournamentFunctions';
import { BIPO_OPEN_TOURNAMENT_YEARS, getBiPoOpenTournamentFallbackTime } from '@/util/bipoOpenTournamentMeta';
import { RankingData, RankingTournament } from './worldRankingPoints';

// Turnierzeitpunkt: letztes Spiel mit Zeitstempel, sonst das hinterlegte Turnierdatum.
const getTournamentTime = (tournament: Tournament, year: string) => {
    const matchTimes = [...tournament.groupPhase.matches, ...tournament.koPhase.matches]
        .flat()
        .map(match => match.time ?? 0);
    const lastMatchTime = Math.max(0, ...matchTimes);
    return lastMatchTime || getBiPoOpenTournamentFallbackTime(year);
};

// Alle Turniere: das Elo-Rating rechnet ab 2020, die Saisonwertung filtert selbst nach Zeitraum.
const loadTournaments = async (): Promise<RankingTournament[]> => {
    const years = BIPO_OPEN_TOURNAMENT_YEARS;

    const results = await Promise.allSettled(years.map(year => getTournamentByName(year)));
    return results.flatMap((result, index) =>
        result.status === 'fulfilled' && result.value
            ? [{ tournament: result.value, time: getTournamentTime(result.value, years[index]) }]
            : []
    );
};

const loadLeagueCups = async () => {
    const results = await Promise.allSettled(
        LEAGUE_SEASONS.filter(season => season.hasCup).map(season => getLeagueCup(season.slug))
    );
    return results.flatMap(result => result.status === 'fulfilled' && result.value ? [result.value] : []);
};

// Rohdaten werden einmal geladen und von Weltrangliste (Elo) und Saisonwertung geteilt.
export function useWorldRankingData() {
    const now = Date.now();
    const data = shallowRef<RankingData | null>(null);
    const isLoading = ref(true);
    const hasError = ref(false);

    Promise.all([getAllOpenGames(), getAllLeagueGames(), loadLeagueCups(), loadTournaments()])
        .then(([openGames, leagueGames, leagueCups, tournaments]) => {
            data.value = { openGames, leagueGames, leagueCups, tournaments };
        })
        .catch(() => hasError.value = true)
        .finally(() => isLoading.value = false);

    return { now, data, isLoading, hasError };
}
