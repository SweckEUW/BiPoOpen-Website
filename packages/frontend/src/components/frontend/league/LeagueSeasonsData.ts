export type LeagueTeam = {
    teamName: string;
    playerName: string;
    logo: string;
};

export type LeagueDivision = {
    league: number;          // Wert, der am Spiel in der DB landet: 1 | 2
    label: string;           // "1. Liga"
    teams: LeagueTeam[];
    hasFinalFour: boolean;
    finalFourSeeds: number;      // sportlich: wer sich fuer das Final Four qualifiziert (Seeding + Badges)
    highlightTopSlots: number;   // optisch: wie viele Plaetze oben blau eingefaerbt werden
    promotionSlots: number;      // Aufstiegsplaetze (gruen) - nur 2. Liga
    relegationSlots: number;     // Abstiegsplaetze (rot) am Tabellenende
};

export type LeagueSeason = {
    slug: string;            // "2025-26" -> URL-Segment
    label: string;           // "2025/26" -> Untertitel
    divisions: LeagueDivision[];
};

const teamLogo = (fileName: string) => new URL(`/src/assets/league/teams/${fileName}`, import.meta.url).href;

// Single source of truth: Saison -> Liga -> Teams.
export const LEAGUE_SEASONS: LeagueSeason[] = [
    {
        slug: '2025-26',
        label: '2025/26',
        divisions: [
            {
                league: 1,
                label: '1. Liga',
                hasFinalFour: true,
                finalFourSeeds: 4,
                highlightTopSlots: 4,
                promotionSlots: 0,
                relegationSlots: 3,
                teams: [
                    { teamName: 'Hangover Heroes', playerName: 'David Jones', logo: teamLogo('Hangover-Heroes.webp') },
                    { teamName: 'Hopfenstreife', playerName: 'Jonas Weck', logo: teamLogo('Hopfenstreife.webp') },
                    { teamName: 'Cupfire Squad', playerName: 'Matthias Weck', logo: teamLogo('Cupfire-Squad.webp') },
                    { teamName: 'Lokomotive Wiedenbrück', playerName: 'Simon Weck', logo: teamLogo('Lokomotive-Wiedenbrueck.webp') },
                    { teamName: 'Don Promillo', playerName: 'Patrick Pohlmann', logo: teamLogo('Don-Promillo.webp') },
                    { teamName: 'Wonne', playerName: 'Daniel Wonnemann', logo: teamLogo('Wonne.webp') },
                    { teamName: 'El Gunto', playerName: 'Matthias Gunter', logo: teamLogo('El-Gunto.webp') },
                    { teamName: 'BPC Likör', playerName: 'Leon Rose', logo: teamLogo('BPC-Likoer.webp') },
                    { teamName: 'Schlauti Saufmann', playerName: 'Sara Schlautmann', logo: teamLogo('Schlauti-Saufmann.webp') },
                    { teamName: 'FC Pongus Longus', playerName: 'Jerome Campigotto', logo: teamLogo('FC-Pongus-Longus.webp') },
                    { teamName: 'BPC Knick', playerName: 'Nick Brinkrolf', logo: teamLogo('BPC-Knick.webp') },
                    { teamName: 'Ostgold', playerName: 'Giulia Sanio', logo: teamLogo('Ostgold.webp') },
                    { teamName: 'Schaufautomat', playerName: 'Jens Schauf', logo: teamLogo('BPC-Schauf.webp') },
                    { teamName: 'Anime Dude', playerName: 'Fritz Falkenreck', logo: teamLogo('Anime-Dude.webp') },
                    { teamName: 'SallyWin All-in', playerName: 'Sally Hollenbeck', logo: teamLogo('SallyWin-All-in.webp') },
                ],
            },
        ],
    },
    {
        slug: '2026-27',
        label: '2026/27',
        divisions: [
            {
                league: 1,
                label: '1. Liga',
                hasFinalFour: true,
                finalFourSeeds: 4,
                highlightTopSlots: 4,
                promotionSlots: 0,
                relegationSlots: 3,
                teams: [
                    { teamName: '4Fisch', playerName: 'David Jones', logo: teamLogo('4Fisch.webp') },
                    { teamName: 'Hopfenstreife', playerName: 'Jonas Weck', logo: teamLogo('Hopfenstreife.webp') },
                    { teamName: 'Sgt. Insane', playerName: 'Matthias Weck', logo: teamLogo('Sgt-Insane.webp') },
                    { teamName: 'Lokomotive Wiedenbrück', playerName: 'Simon Weck', logo: teamLogo('Lokomotive-Wiedenbrueck.webp') },
                    { teamName: 'Don Promillo', playerName: 'Patrick Pohlmann', logo: teamLogo('Don-Promillo.webp') },
                    { teamName: 'Wonne', playerName: 'Daniel Wonnemann', logo: teamLogo('Wonne.webp') },
                    { teamName: 'El Gunto', playerName: 'Matthias Gunter', logo: teamLogo('El-Gunto.webp') },
                    { teamName: 'BPC Likör', playerName: 'Leon Rose', logo: teamLogo('BPC-Likoer.webp') },
                    { teamName: 'Schlauti Saufmann', playerName: 'Sara Schlautmann', logo: teamLogo('Schlauti-Saufmann.webp') },
                    { teamName: 'Schaufautomat', playerName: 'Jens Schauf', logo: teamLogo('BPC-Schauf.webp') },
                    { teamName: 'Anime Dude', playerName: 'Fritz Falkenreck', logo: teamLogo('Anime-Dude.webp') },
                    { teamName: 'SallyWin All-in', playerName: 'Sally Hollenbeck', logo: teamLogo('SallyWin-All-in.webp') },
                ],
            },
            {
                league: 2,
                label: '2. Liga',
                hasFinalFour: true,
                finalFourSeeds: 4,
                highlightTopSlots: 0,
                promotionSlots: 3,
                relegationSlots: 0,
                teams: [
                    { teamName: 'FC Pongus Longus', playerName: 'Jerome Campigotto', logo: teamLogo('FC-Pongus-Longus.webp') },
                    { teamName: 'Ostgold', playerName: 'Giulia Sanio', logo: teamLogo('Ostgold.webp') },
                    { teamName: 'JP Pongande', playerName: 'Janine Pergande', logo: teamLogo('JP-Pongande.webp') },
                    { teamName: 'Bruderluie', playerName: 'Michael Pohlmann', logo: teamLogo('Bruderluie.webp') },
                    { teamName: 'Shot Queen', playerName: 'Nele Wonnemann', logo: teamLogo('Shot-Queen.webp') },
                    { teamName: 'Christina Zellmer', playerName: 'Christina Zellmer', logo: teamLogo('BiPo-League-Logo.webp') },
                    { teamName: 'Dana Pohlmann', playerName: 'Dana Pohlmann', logo: teamLogo('BiPo-League-Logo.webp') },
                    { teamName: 'Leoni Straub', playerName: 'Leoni Straub', logo: teamLogo('BiPo-League-Logo.webp') },
                    { teamName: 'Michelle Langer', playerName: 'Michelle Langer', logo: teamLogo('BiPo-League-Logo.webp') },
                    { teamName: 'Annabell Kramme', playerName: 'Annabell Kramme', logo: teamLogo('BiPo-League-Logo.webp') },
                    { teamName: 'Michael Weck', playerName: 'Michael Weck', logo: teamLogo('BiPo-League-Logo.webp') },
                    { teamName: 'Fynn Schwedes', playerName: 'Fynn Schwedes', logo: teamLogo('BiPo-League-Logo.webp') },
                    { teamName: 'Leo Heinrichsmeier', playerName: 'Leo Heinrichsmeier', logo: teamLogo('BiPo-League-Logo.webp') },
                ],
            },
        ],
    },
];

// Saison, auf die /League weiterleitet und die das Home-Widget zeigt.
// Bei jedem Saisonwechsel hier auf die neue Saison umstellen.
export const CURRENT_SEASON_SLUG = '2026-27';

// Saison/Liga fuer Altdaten, die noch kein season/league Feld in der DB haben.
export const LEGACY_SEASON_SLUG = '2025-26';
export const LEGACY_LEAGUE = 1;

export const getSeason = (slug: string | undefined): LeagueSeason | undefined =>
    LEAGUE_SEASONS.find(season => season.slug === slug);

export const getDivision = (season: LeagueSeason | undefined, league: number | undefined): LeagueDivision | undefined => {
    if (!season) return undefined;
    if (league === undefined) return season.divisions[0];
    return season.divisions.find(division => division.league === league);
};

// Doppelte Hin- und Rueckrunde: jedes Team spielt gegen jedes andere zweimal.
export const getRegularSeasonGameCount = (division: LeagueDivision | undefined): number => {
    const teamCount = division?.teams.length ?? 0;
    if (teamCount < 2) return 0;
    return teamCount * (teamCount - 1);
};

export const getSeasonTeams = (season: LeagueSeason | undefined): LeagueTeam[] =>
    season ? season.divisions.flatMap(division => division.teams) : [];

export const toLeaguePlayers = (teams: LeagueTeam[]): LeaguePlayer[] =>
    teams.map(({ teamName, logo }) => ({ name: teamName, logo }));
