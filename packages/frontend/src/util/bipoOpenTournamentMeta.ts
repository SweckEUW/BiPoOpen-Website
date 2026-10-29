export const BIPO_OPEN_TOURNAMENT_YEARS = ['2020', '2022', '2023', '2024', '2025', '2026'] as const;

export type BiPoOpenTournamentYear = (typeof BIPO_OPEN_TOURNAMENT_YEARS)[number];

// Fallback dates for historical tournaments used when match.time is missing.
// Adjust these values if you want exact event days.
export const BIPO_OPEN_TOURNAMENT_DATE_MAP: Record<BiPoOpenTournamentYear, string> = {
    '2020': '2020-07-01',
    '2022': '2022-07-01',
    '2023': '2023-07-01',
    '2024': '2024-07-01',
    '2025': '2025-07-01',
    '2026': '2026-07-11',
};

export const getBiPoOpenTournamentFallbackTime = (year: string): number => {
    let date = BIPO_OPEN_TOURNAMENT_DATE_MAP[year as BiPoOpenTournamentYear];
    if (!date) return 0;
    return new Date(`${date}T14:00:00`).getTime();
};

// Next upcoming tournament (shown in the tournament picker)
export const NEXT_BIPO_OPEN = { year: '2027', date: '2027-06-26' };

export const BIPO_OPEN_WINNERS = [
    { year: "2026", name: "Alki Süd", player1: "Jannick Becker", player2: "Frederick Reckhaus"},
    { year: "2025", name: "Weck-Knicken", player1: "Nick Brinkrolf", player2: "Simon Weck"},
    { year: "2024", name: "Team Vogelnest", player1: "Lewin Pohlschmidt", player2: "Mattis Post"},
    { year: "2023", name: "Berufsalkoholiker", player1: "Jonas Weck", player2: "Leon Rose"},
    { year: "2022", name: "Taube Nüsschen", player1: "Patrick Pohlmann", player2: "Tim Becker"},
    { year: "2021", name: "Pong Daddys", player1: "Matthias Weck", player2: "Lennard Kaffitz"},
    { year: "2020", name: "Dynamo #DruckAmGlas", player1: "Alexander Borsig", player2: "Björn Harz"}
];
