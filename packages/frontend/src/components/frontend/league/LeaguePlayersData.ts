export type LeaguePlayerData = {
    teamName: string;
    playerName: string;
    logo: string;
};

// Single source of truth: Teamname, echter Spielername und Teamlogo an einer Stelle.
export const LEAGUE_PLAYER_DATA: LeaguePlayerData[] = [
    { teamName: 'Hangover Heroes', playerName: 'David Jones', logo: new URL('/src/assets/league/teams/Hangover-Heroes.webp', import.meta.url).href },
    { teamName: 'Hopfenstreife', playerName: 'Jonas Weck', logo: new URL('/src/assets/league/teams/Hopfenstreife.webp', import.meta.url).href },
    { teamName: 'Cupfire Squad', playerName: 'Matthias Weck', logo: new URL('/src/assets/league/teams/Cupfire-Squad.webp', import.meta.url).href },
    { teamName: 'Lokomotive Wiedenbrück', playerName: 'Simon Weck', logo: new URL('/src/assets/league/teams/Lokomotive-Wiedenbrueck.webp', import.meta.url).href },
    { teamName: 'Don Promillo', playerName: 'Patrick Pohlmann', logo: new URL('/src/assets/league/teams/Don-Promillo.webp', import.meta.url).href },
    { teamName: 'Wonne', playerName: 'Daniel Wonnemann', logo: new URL('/src/assets/league/teams/Wonne.webp', import.meta.url).href },
    { teamName: 'El Gunto', playerName: 'Matthias Gunter', logo: new URL('/src/assets/league/teams/El-Gunto.webp', import.meta.url).href },
    { teamName: 'BPC Likör', playerName: 'Leon Rose', logo: new URL('/src/assets/league/teams/BPC-Likoer.webp', import.meta.url).href },
    { teamName: 'Schlauti Saufmann', playerName: 'Sara Schlautmann', logo: new URL('/src/assets/league/teams/Schlauti-Saufmann.webp', import.meta.url).href },
    { teamName: 'FC Pongus Longus', playerName: 'Jerome Campigotto', logo: new URL('/src/assets/league/teams/FC-Pongus-Longus.webp', import.meta.url).href },
    { teamName: 'BPC Knick', playerName: 'Nick Brinkrolf', logo: new URL('/src/assets/league/teams/BPC-Knick.webp', import.meta.url).href },
    { teamName: 'Ostgold', playerName: 'Giulia Sanio', logo: new URL('/src/assets/league/teams/Ostgold.webp', import.meta.url).href },
    { teamName: 'Schaufautomat', playerName: 'Jens Schauf', logo: new URL('/src/assets/league/teams/BPC-Schauf.webp', import.meta.url).href },
    { teamName: 'Anime Dude', playerName: 'Fritz Falkenreck', logo: new URL('/src/assets/league/teams/Anime-Dude.webp', import.meta.url).href },
    { teamName: 'SallyWin All-in', playerName: 'Sally Hollenbeck', logo: new URL('/src/assets/league/teams/SallyWin-All-in.webp', import.meta.url).href },
];

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
