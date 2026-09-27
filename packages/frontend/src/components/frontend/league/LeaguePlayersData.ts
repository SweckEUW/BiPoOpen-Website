import { LEAGUE_SEASONS } from './LeagueSeasonsData';

export type LeaguePlayerData = {
    teamName: string;
    playerName: string;
    logo: string;
};

// Abgeleitet aus LeagueSeasonsData: alle Teams ueber alle Saisons und Ligen, dedupliziert.
// Saisonuebergreifende Konsumenten (Spielerprofil, Badges, OG-Bilder) nutzen weiterhin diese Liste.
export const LEAGUE_PLAYER_DATA: LeaguePlayerData[] = (() => {
    const teamsByName = new Map<string, LeaguePlayerData>();

    LEAGUE_SEASONS.forEach((season) => {
        season.divisions.forEach((division) => {
            division.teams.forEach(({ teamName, playerName, logo }) => {
                // Neuere Saisons stehen weiter hinten und gewinnen bei gleichem Teamnamen.
                teamsByName.set(teamName, { teamName, playerName, logo });
            });
        });
    });

    return [...teamsByName.values()];
})();

// Kompatibilitaet: bestehende Verwendungen koennen weiter LEAGUE_PLAYERS/LEAGUE_PLAYER_MAP nutzen.
export const LEAGUE_PLAYERS: LeaguePlayer[] = LEAGUE_PLAYER_DATA.map(({ teamName, logo }) => ({
    name: teamName,
    logo,
}));

export const LEAGUE_PLAYER_MAP: Record<string, string> = Object.fromEntries(
    LEAGUE_PLAYER_DATA.map(({ teamName, playerName }) => [teamName, playerName])
) as Record<string, string>;

const normalizeName = (value: string): string =>
    value
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();

export const getLeagueTeamForPlayer = (playerName: string): string | null => {
    for (const entry of LEAGUE_PLAYER_DATA) {
        if (normalizeName(entry.playerName) === normalizeName(playerName)) return entry.teamName;
    }
    return null;
};

export const getPlayerForLeagueTeam = (teamName: string): string | null => {
    const exact = LEAGUE_PLAYER_DATA.find(entry => entry.teamName === teamName);
    if (exact) return exact.playerName;

    const normalizedTeamName = normalizeName(teamName);
    for (const entry of LEAGUE_PLAYER_DATA) {
        if (normalizeName(entry.teamName) === normalizedTeamName) return entry.playerName;
    }

    return null;
};
