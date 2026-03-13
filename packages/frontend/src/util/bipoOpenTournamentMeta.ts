export const BIPO_OPEN_TOURNAMENT_YEARS = ['2020', '2022', '2023', '2024', '2025'] as const;

export type BiPoOpenTournamentYear = (typeof BIPO_OPEN_TOURNAMENT_YEARS)[number];

// Fallback dates for historical tournaments used when match.time is missing.
// Adjust these values if you want exact event days.
export const BIPO_OPEN_TOURNAMENT_DATE_MAP: Record<BiPoOpenTournamentYear, string> = {
    '2020': '2020-07-01',
    '2022': '2022-07-01',
    '2023': '2023-07-01',
    '2024': '2024-07-01',
    '2025': '2025-07-01',
};

export const getBiPoOpenTournamentFallbackTime = (year: string): number => {
    let date = BIPO_OPEN_TOURNAMENT_DATE_MAP[year as BiPoOpenTournamentYear];
    if (!date) return 0;
    return new Date(`${date}T14:00:00`).getTime();
};
