// Zuordnung: Liga-Teamname → Echter Spielername
// Trage hier die echten Spielernamen ein, die zu den Liga-Teams gehören.
// Der Spielername muss exakt so geschrieben sein wie in Offenen Spielen / Turnieren.

export const LEAGUE_PLAYER_MAP: Record<string, string> = {
    "Hangover Heroes": "David Jones",        // z.B. "Simon Weck"
    "Hopfenstreife": "Jonas Weck",
    "Cupfire Squad": "Matthias Weck",
    "Lokomotive Wiedenbrück": "Simon Weck",
    "Don Promillo": "Patrick Pohlmann",
    "Wonne": "Daniel Wonnemann",
    "El Gunto": "Matthias Gunter",
    "BPC Likör": "Leon Rose",
    "Schlauti Saufmann": "Sara Schlautmann",
    "FC Pongus Longus": "Jerome Campigotto",
    "BPC Knick": "Nick Brinkrolf",
    "Ostgold": "Giulia Sanio",
    "Schaufautomat": "Jens Schauf",
    "Anime Dude": "Fritz Falkenreck",
    "SallyWin All-in": "Sally Hollenbeck",
};

const normalizeName = (value: string): string =>
    value
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();

export const getLeagueTeamForPlayer = (playerName: string): string | null => {
    for (let [team, name] of Object.entries(LEAGUE_PLAYER_MAP)) {
        if (name && normalizeName(name) === normalizeName(playerName)) return team;
    }
    return null;
};

export const getPlayerForLeagueTeam = (teamName: string): string | null => {
    const exact = LEAGUE_PLAYER_MAP[teamName];
    if (exact) return exact;

    const normalizedTeamName = normalizeName(teamName);
    for (const [team, player] of Object.entries(LEAGUE_PLAYER_MAP)) {
        if (normalizeName(team) === normalizedTeamName) return player;
    }

    return null;
};
