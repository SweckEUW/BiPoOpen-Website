import { getAllOpenGames } from '@/components/frontend/openGames/OpenGamesUtilFunctions';
import { getAllLeagueGames } from '@/components/frontend/league/LeagueUtilFunctions';
import { getTournamentByName } from '@/util/tournamentFunctions';
import { BIPO_OPEN_TOURNAMENT_YEARS, getBiPoOpenTournamentFallbackTime } from '@/util/bipoOpenTournamentMeta';

// Alle offiziellen Spiele (offene Spiele, Liga/Cup, BiPo-Open-Turniere) einmal parallel laden und teilen.
// Spielerprofil, Weltrangliste und Spielersuche rechnen alle auf denselben Daten.

export type GameDataTournament = { year: string; tournament: Tournament; time: number };

export type GameData = {
    openGames: Match[];
    leagueGames: Match[];
    tournaments: GameDataTournament[];
};

// Danach wird im Hintergrund neu geladen, die alten Daten bleiben bis dahin sichtbar.
const MAX_AGE_MS = 5 * 60 * 1000;

let cache: { data: GameData; loadedAt: number } | null = null;
let request: Promise<GameData> | null = null;

// Turnierzeitpunkt: letztes Spiel mit Zeitstempel, sonst das hinterlegte Turnierdatum.
const getTournamentTime = (tournament: Tournament, year: string) => {
    const matchTimes = [...tournament.groupPhase.matches, ...tournament.koPhase.matches]
        .flat()
        .map(match => match.time ?? 0);
    const lastMatchTime = Math.max(0, ...matchTimes);
    return lastMatchTime || getBiPoOpenTournamentFallbackTime(year);
};

const loadTournaments = async (): Promise<GameDataTournament[]> => {
    const results = await Promise.allSettled(BIPO_OPEN_TOURNAMENT_YEARS.map(year => getTournamentByName(year)));
    return results.flatMap((result, index) => {
        const year = BIPO_OPEN_TOURNAMENT_YEARS[index];
        return result.status === 'fulfilled' && result.value
            ? [{ year, tournament: result.value, time: getTournamentTime(result.value, year) }]
            : [];
    });
};

// Sofort verfuegbare Daten (auch wenn sie schon aelter sind), null vor dem ersten Laden.
export const getCachedGameData = (): GameData | null => cache?.data ?? null;

export const getGameData = (): Promise<GameData> => {
    if (cache && Date.now() - cache.loadedAt < MAX_AGE_MS) return Promise.resolve(cache.data);
    if (request) return request;

    request = Promise.all([getAllOpenGames(), getAllLeagueGames(), loadTournaments()])
        .then(([openGames, leagueGames, tournaments]) => {
            const data = { openGames, leagueGames, tournaments };
            cache = { data, loadedAt: Date.now() };
            return data;
        })
        .finally(() => request = null);

    return request;
};

// Nach dem Eintragen eines Spiels: beim naechsten Zugriff frisch laden.
export const clearGameDataCache = () => {
    if (cache) cache.loadedAt = 0;
};
