import { ref, shallowRef } from 'vue';
import { getAllOpenGames } from '@/components/frontend/openGames/OpenGamesUtilFunctions';
import { getAllLeagueGames } from '@/components/frontend/league/LeagueUtilFunctions';
import { getLeagueCup } from '@/components/frontend/league/cup/LeagueCupUtilFunctions';
import { LEAGUE_SEASONS } from '@/components/frontend/league/LeagueSeasonsData';
import { getTournamentByName } from '@/util/tournamentFunctions';
import { BIPO_OPEN_TOURNAMENT_YEARS, getBiPoOpenTournamentFallbackTime } from '@/util/bipoOpenTournamentMeta';
import { RANKING_TREND_DAYS, RANKING_WINDOW_DAYS, RankingEvents, RankingTournament, buildRankingEvents } from './worldRankingPoints';

const DAY_MS = 24 * 60 * 60 * 1000;

// Turnierzeitpunkt: letztes Spiel mit Zeitstempel, sonst das hinterlegte Turnierdatum.
const getTournamentTime = (tournament: Tournament, year: string) => {
    const matchTimes = [...tournament.groupPhase.matches, ...tournament.koPhase.matches]
        .flat()
        .map(match => match.time ?? 0);
    const lastMatchTime = Math.max(0, ...matchTimes);
    return lastMatchTime || getBiPoOpenTournamentFallbackTime(year);
};

const loadTournaments = async (now: number): Promise<RankingTournament[]> => {
    // Nur Turniere, die fuer die aktuelle Rangliste oder die Trend-Rangliste in Frage kommen
    const from = now - (RANKING_WINDOW_DAYS + RANKING_TREND_DAYS + 31) * DAY_MS;
    const years = BIPO_OPEN_TOURNAMENT_YEARS.filter(year => getBiPoOpenTournamentFallbackTime(year) >= from);

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

export function useWorldRankingData() {
    const now = Date.now();
    const events = shallowRef<RankingEvents | null>(null);
    const isLoading = ref(true);
    const hasError = ref(false);

    Promise.all([getAllOpenGames(), getAllLeagueGames(), loadLeagueCups(), loadTournaments(now)])
        .then(([openGames, leagueGames, leagueCups, tournaments]) => {
            events.value = buildRankingEvents({ openGames, leagueGames, leagueCups, tournaments });
        })
        .catch(() => hasError.value = true)
        .finally(() => isLoading.value = false);

    return { now, events, isLoading, hasError };
}
