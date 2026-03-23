import { getAllOpenGames, getMatchesFromPlayer as getOpenGameMatchesFromPlayer } from "@/components/frontend/openGames/OpenGamesUtilFunctions";
import { getAllLeagueGames, getMatchesFromPlayer as getLeagueMatchesFromPlayer } from "@/components/frontend/league/LeagueUtilFunctions";
import { getTournamentByName } from "@/util/tournamentFunctions";
import { getFinishedMatchesFromPlayer } from "@/util/tournamentPlayerFunctions";
import { checkIfTeam1WonVsTeam2 } from "@/util/tournamentMatchFunctions";
import { BIPO_OPEN_TOURNAMENT_YEARS, getBiPoOpenTournamentFallbackTime } from "@/util/bipoOpenTournamentMeta";
import { calculateBadges } from "./BadgeRegistry";
import { getLeagueTeamForPlayer } from "./LeaguePlayerMapping";

const TREND_PERIOD_DAYS: Record<Exclude<TrendPeriod, 'all'>, number> = {
    '1m': 30,
    '3m': 90,
    '6m': 180,
    '1y': 365,
};

const PLAYER_NAMES_CACHE_KEY = 'bipo-player-names-cache-v1';
const PLAYER_NAMES_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
let cachedPlayerNames: string[] | null = null;
let playerNamesRequest: Promise<string[]> | null = null;

export const getAllPlayerNames = async (): Promise<string[]> => {
    if (cachedPlayerNames) return cachedPlayerNames;
    if (playerNamesRequest) return playerNamesRequest;

    if (typeof window !== 'undefined') {
        try {
            const rawCache = window.localStorage.getItem(PLAYER_NAMES_CACHE_KEY);
            if (rawCache) {
                const parsed = JSON.parse(rawCache) as { timestamp: number; names: string[] };
                if (
                    parsed &&
                    Array.isArray(parsed.names) &&
                    typeof parsed.timestamp === 'number' &&
                    Date.now() - parsed.timestamp < PLAYER_NAMES_CACHE_TTL_MS
                ) {
                    cachedPlayerNames = parsed.names;
                    return cachedPlayerNames;
                }
            }
        } catch {
            // Ignore cache parse/storage errors and continue with network fetch.
        }
    }

    playerNamesRequest = (async () => {
        const allNames: Set<string> = new Set();

        const [openGames, leagueGames, tournaments] = await Promise.all([
            getAllOpenGames(),
            getAllLeagueGames(),
            Promise.all(BIPO_OPEN_TOURNAMENT_YEARS.map((year) => getTournamentByName(year))),
        ]);

        openGames.forEach(game => {
            [...game.team1.players, ...game.team2.players].forEach(p => {
                allNames.add(formatName(p.name));
            });
        });

        leagueGames.forEach(game => {
            [...game.team1.players, ...game.team2.players].forEach(p => {
                allNames.add(formatName(p.name));
            });
        });

        tournaments.forEach(tournament => {
            if (!tournament) return;
            tournament.teams.forEach(team => {
                team.players.forEach(p => allNames.add(formatName(p.name)));
            });
        });

        const names = Array.from(allNames).sort();
        cachedPlayerNames = names;

        if (typeof window !== 'undefined') {
            try {
                window.localStorage.setItem(
                    PLAYER_NAMES_CACHE_KEY,
                    JSON.stringify({ timestamp: Date.now(), names })
                );
            } catch {
                // Ignore storage quota/private mode errors.
            }
        }

        return names;
    })();

    try {
        return await playerNamesRequest;
    } finally {
        playerNamesRequest = null;
    }
};

const formatName = (name: string) =>
    name.split(" ").map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(" ");

const didPlayerWinMatch = (match: Match, playerName: string): boolean => {
    let lo = playerName.toLowerCase();
    let t1 = match.team1.players.reduce((a, p) => a + p.score, 0);
    let t2 = match.team2.players.reduce((a, p) => a + p.score, 0);
    return match.team1.players.some(p => p.name.toLowerCase() === lo) ? t1 > t2 : t2 > t1;
};

const getPlayerHitsInMatch = (match: Match, playerName: string): number => {
    let lo = playerName.toLowerCase();
    let p = match.team1.players.find(p => p.name.toLowerCase() === lo) || match.team2.players.find(p => p.name.toLowerCase() === lo);
    return p ? p.score : 0;
};

const getOpponentName = (match: Match, playerName: string): string => {
    let lo = playerName.toLowerCase();
    let isTeam1 = match.team1.players.some(p => p.name.toLowerCase() === lo);
    return (isTeam1 ? match.team2.players : match.team1.players).map(p => formatName(p.name)).join(" & ");
};

const getPartnerName = (match: Match, playerName: string): string | null => {
    let lo = playerName.toLowerCase();
    let isTeam1 = match.team1.players.some(p => p.name.toLowerCase() === lo);
    let team = isTeam1 ? match.team1.players : match.team2.players;
    if (team.length < 2) return null;
    let partner = team.find(p => p.name.toLowerCase() !== lo);
    return partner ? formatName(partner.name) : null;
};

const getPlayerIndexInMatch = (match: Match, playerName: string): { teamIndex: number; playerIndex: number } | null => {
    let lo = playerName.toLowerCase();
    for (let ti = 0; ti < 2; ti++) {
        let team = ti === 0 ? match.team1 : match.team2;
        for (let pi = 0; pi < team.players.length; pi++) {
            if (team.players[pi].name.toLowerCase() === lo) return { teamIndex: ti, playerIndex: pi };
        }
    }
    return null;
};

const calculateStreaks = (matchHistory: { match: Match; time: number }[], playerName: string) => {
    let sorted = [...matchHistory].filter(m => m.time > 0).sort((a, b) => a.time - b.time);
    let best = 0, temp = 0, worstLosing = 0, tempLosing = 0;

    sorted.forEach(e => {
        if (didPlayerWinMatch(e.match, playerName)) {
            temp++;
            if (temp > best) best = temp;
            tempLosing = 0;
        } else {
            temp = 0;
            tempLosing++;
            if (tempLosing > worstLosing) worstLosing = tempLosing;
        }
    });

    return { current: temp, best, longestLosing: worstLosing };
};

const calculateStreaksFromResults = (matchHistory: { time: number; won: boolean }[]) => {
    let sorted = [...matchHistory].filter(m => m.time > 0).sort((a, b) => a.time - b.time);
    let best = 0, temp = 0, worstLosing = 0, tempLosing = 0;

    sorted.forEach(e => {
        if (e.won) {
            temp++;
            if (temp > best) best = temp;
            tempLosing = 0;
        } else {
            temp = 0;
            tempLosing++;
            if (tempLosing > worstLosing) worstLosing = tempLosing;
        }
    });

    return { current: temp, best, longestLosing: worstLosing };
};

const calculateTrends = (matchHistory: (MatchHistoryEntry & { won: boolean; hits: number })[], trendPeriod: Exclude<TrendPeriod, 'all'>): TrendData => {
    let now = Date.now();
    let periodMs = TREND_PERIOD_DAYS[trendPeriod] * 24 * 60 * 60 * 1000;
    let cutoff = now - periodMs;
    let previousCutoff = cutoff - periodMs;

    let recent = matchHistory.filter(m => m.time > cutoff && m.time > 0);
    // Historical baseline: all matches before cutoff (stable reference for winrate/avg)
    let historical = matchHistory.filter(m => m.time <= cutoff && m.time > 0);
    // Preceding period: same window before recent (for activity comparison)
    let preceding = matchHistory.filter(m => m.time > previousCutoff && m.time <= cutoff && m.time > 0);

    const nullResult: TrendData = { winrateTrend: null, averageHitsTrend: null, totalMatchesTrend: null, totalHitsTrend: null, avg1v1Trend: null, avg2v2Trend: null };
    if (recent.length < 3) return nullResult;

    // Winrate and avg hits compare recent vs historical baseline (prevents extreme swings)
    let winrateTrend: number | null = null;
    let averageHitsTrend: number | null = null;
    if (historical.length >= 5) {
        let rWr = recent.filter(m => m.won).length / recent.length * 100;
        let hWr = historical.filter(m => m.won).length / historical.length * 100;
        winrateTrend = Math.round((rWr - hWr) * 10) / 10;

        let rAvg = recent.reduce((a, m) => a + m.hits, 0) / recent.length;
        let hAvg = historical.reduce((a, m) => a + m.hits, 0) / historical.length;
        averageHitsTrend = Math.round((rAvg - hAvg) * 100) / 100;
    }

    // Activity trends: compare recent period vs preceding period
    let totalMatchesTrend = recent.length - preceding.length;
    let totalHitsTrend = recent.reduce((a, m) => a + m.hits, 0) - preceding.reduce((a, m) => a + m.hits, 0);

    // Per-category average hits trends (recent vs historical baseline)
    let r1v1 = recent.filter(m => m.source === 'Offene Spiele 1v1');
    let h1v1 = historical.filter(m => m.source === 'Offene Spiele 1v1');
    let r2v2 = recent.filter(m => m.source === 'Offene Spiele 2v2');
    let h2v2 = historical.filter(m => m.source === 'Offene Spiele 2v2');

    let avg1v1Trend = (r1v1.length >= 2 && h1v1.length >= 3)
        ? Math.round((r1v1.reduce((a, m) => a + m.hits, 0) / r1v1.length - h1v1.reduce((a, m) => a + m.hits, 0) / h1v1.length) * 100) / 100
        : null;
    let avg2v2Trend = (r2v2.length >= 3 && h2v2.length >= 5)
        ? Math.round((r2v2.reduce((a, m) => a + m.hits, 0) / r2v2.length - h2v2.reduce((a, m) => a + m.hits, 0) / h2v2.length) * 100) / 100
        : null;

    return { winrateTrend, averageHitsTrend, totalMatchesTrend, totalHitsTrend, avg1v1Trend, avg2v2Trend };
};

const analyzeTurns = (matchHistory: { match: Match }[], playerName: string): { turnAnalysis: TurnAnalysis; cupHeatmap: CupHeatmap } => {
    let analysis: TurnAnalysis = { hit: 0, miss: 0, airball: 0, bomb: 0, bouncer: 0, trickshot: 0, onfire: 0, ballsback: 0, lastCup: 0, total: 0 };
    let heatmap: CupHeatmap = new Array(10).fill(0);

    matchHistory.forEach(({ match }) => {
        if (!match.turns || match.turns.length === 0) return;
        let idx = getPlayerIndexInMatch(match, playerName);
        if (!idx) return;

        match.turns.forEach(turn => {
            if (turn.teamIndex !== idx!.teamIndex || turn.playerIndex !== idx!.playerIndex) return;
            analysis.total++;
            analysis[turn.type]++;

            let data = turn.data as any;
            if (data?.cupIndex !== undefined) heatmap[data.cupIndex] = (heatmap[data.cupIndex] || 0) + 1;
            if (data?.cupIndex1 !== undefined) heatmap[data.cupIndex1] = (heatmap[data.cupIndex1] || 0) + 1;
            if (data?.cupIndex2 !== undefined) heatmap[data.cupIndex2] = (heatmap[data.cupIndex2] || 0) + 1;
            if (data?.cupIndex3 !== undefined) heatmap[data.cupIndex3] = (heatmap[data.cupIndex3] || 0) + 1;
        });
    });

    return { turnAnalysis: analysis, cupHeatmap: heatmap };
};

const calculateExtraStats = (matchHistory: { match: Match; time: number }[], playerName: string): ExtraStats => {
    let fastestWinMinutes: number | null = null;

    // Fastest win
    matchHistory.forEach(({ match, time }) => {
        if (!match.endTime || !time || time === 0) return;
        if (!didPlayerWinMatch(match, playerName)) return;
        let duration = (match.endTime - time) / 60000;
        if (duration > 0 && (fastestWinMinutes === null || duration < fastestWinMinutes)) {
            fastestWinMinutes = Math.round(duration * 10) / 10;
        }
    });

    // Time of day (2h blocks) - build all blocks from 0-24
    let timeBlocks: Map<number, { wins: number; total: number }> = new Map();
    matchHistory.forEach(({ match, time }) => {
        if (!time || time === 0) return;
        let hour = new Date(time).getHours();
        let blockStart = Math.floor(hour / 2) * 2;
        let block = timeBlocks.get(blockStart) || { wins: 0, total: 0 };
        block.total++;
        if (didPlayerWinMatch(match, playerName)) block.wins++;
        timeBlocks.set(blockStart, block);
    });

    // Build sorted array of all blocks that have games
    let timeOfDayStats: TimeOfDayBlock[] = [];
    for (let h = 0; h < 24; h += 2) {
        let block = timeBlocks.get(h);
        if (!block || block.total === 0) continue;
        timeOfDayStats.push({
            label: `${h}-${h + 2} Uhr`,
            wins: block.wins,
            losses: block.total - block.wins,
            total: block.total,
            winrate: Math.round(block.wins / block.total * 100),
        });
    }

    // Best time of day (min 3 games)
    let bestTimeOfDay: string | null = null;
    let bestTimeWinrate: number | null = null;
    timeOfDayStats.forEach(block => {
        if (block.total < 3) return;
        if (bestTimeWinrate === null || block.winrate > bestTimeWinrate) {
            bestTimeWinrate = block.winrate;
            bestTimeOfDay = block.label;
        }
    });

    // Most active time of day
    let mostActiveTimeOfDay: string | null = null;
    let mostActiveGames: number | null = null;
    timeOfDayStats.forEach(block => {
        if (mostActiveGames === null || block.total > mostActiveGames) {
            mostActiveGames = block.total;
            mostActiveTimeOfDay = block.label;
        }
    });

    return { fastestWinMinutes, bestTimeOfDay, bestTimeWinrate, longestLosingStreak: 0, timeOfDayStats, mostActiveTimeOfDay, mostActiveGames };
};

const calculateExtraStatsFromResults = (matchHistory: { match: Match; time: number; won: boolean }[]): ExtraStats => {
    let fastestWinMinutes: number | null = null;

    matchHistory.forEach(({ match, time, won }) => {
        if (!match.endTime || !time || time === 0) return;
        if (!won) return;
        let duration = (match.endTime - time) / 60000;
        if (duration > 0 && (fastestWinMinutes === null || duration < fastestWinMinutes)) {
            fastestWinMinutes = Math.round(duration * 10) / 10;
        }
    });

    let timeBlocks: Map<number, { wins: number; total: number }> = new Map();
    matchHistory.forEach(({ time, won }) => {
        if (!time || time === 0) return;
        let hour = new Date(time).getHours();
        let blockStart = Math.floor(hour / 2) * 2;
        let block = timeBlocks.get(blockStart) || { wins: 0, total: 0 };
        block.total++;
        if (won) block.wins++;
        timeBlocks.set(blockStart, block);
    });

    let timeOfDayStats: TimeOfDayBlock[] = [];
    for (let h = 0; h < 24; h += 2) {
        let block = timeBlocks.get(h);
        if (!block || block.total === 0) continue;
        timeOfDayStats.push({
            label: `${h}-${h + 2} Uhr`,
            wins: block.wins,
            losses: block.total - block.wins,
            total: block.total,
            winrate: Math.round(block.wins / block.total * 100),
        });
    }

    let bestTimeOfDay: string | null = null;
    let bestTimeWinrate: number | null = null;
    timeOfDayStats.forEach(block => {
        if (block.total < 3) return;
        if (bestTimeWinrate === null || block.winrate > bestTimeWinrate) {
            bestTimeWinrate = block.winrate;
            bestTimeOfDay = block.label;
        }
    });

    let mostActiveTimeOfDay: string | null = null;
    let mostActiveGames: number | null = null;
    timeOfDayStats.forEach(block => {
        if (mostActiveGames === null || block.total > mostActiveGames) {
            mostActiveGames = block.total;
            mostActiveTimeOfDay = block.label;
        }
    });

    return { fastestWinMinutes, bestTimeOfDay, bestTimeWinrate, longestLosingStreak: 0, timeOfDayStats, mostActiveTimeOfDay, mostActiveGames };
};

export const getPlayerProfileData = async (playerName: string, trendPeriod: TrendPeriod = '1m'): Promise<PlayerProfileData> => {
    let playerNameLower = playerName.toLowerCase();
    let matchHistory: (MatchHistoryEntry & { won: boolean; hits: number })[] = [];
    let rivals: Map<string, { wins: number; losses: number }> = new Map();
    let partnersMap: Map<string, { matches: number; wins: number; losses: number }> = new Map();
    let categories: CategoryStats[] = [];

    const processMatches = (matches: Match[], source: string, categoryName: string, nameForMatch?: string) => {
        let effectiveName = nameForMatch || playerName;
        let stats = { name: categoryName, matches: matches.length, wins: 0, hits: 0, averageHits: 0 };
        matches.forEach(m => {
            let won = didPlayerWinMatch(m, effectiveName);
            let hits = getPlayerHitsInMatch(m, effectiveName);
            if (won) stats.wins++;
            stats.hits += hits;
            matchHistory.push({ match: m, source, time: m.time || 0, won, hits });

            let oppName = getOpponentName(m, effectiveName);
            let rival = rivals.get(oppName) || { wins: 0, losses: 0 };
            if (won) rival.wins++; else rival.losses++;
            rivals.set(oppName, rival);

            let partnerName = getPartnerName(m, effectiveName);
            if (partnerName) {
                let p = partnersMap.get(partnerName) || { matches: 0, wins: 0, losses: 0 };
                p.matches++;
                if (won) p.wins++; else p.losses++;
                partnersMap.set(partnerName, p);
            }
        });
        stats.averageHits = stats.matches > 0 ? stats.hits / stats.matches : 0;
        if (stats.matches > 0) categories.push(stats);
    };

    // 1. Open Games
    let openGames = await getAllOpenGames();
    processMatches(getOpenGameMatchesFromPlayer(openGames, playerNameLower, true), "Offene Spiele 1v1", "Offene Spiele 1v1");
    processMatches(getOpenGameMatchesFromPlayer(openGames, playerNameLower, false), "Offene Spiele 2v2", "Offene Spiele 2v2");

    // 2. League Games (via mapping)
    let leagueTeam = getLeagueTeamForPlayer(playerName);
    let leagueGames = await getAllLeagueGames();
    if (leagueTeam) {
        let leaguePlayerNameLower = leagueTeam.toLowerCase();
        let leagueMatches = getLeagueMatchesFromPlayer(leagueGames, leaguePlayerNameLower);
        processMatches(leagueMatches, "BiPo League", "BiPo League", leagueTeam);
    } else {
        // Fallback: try direct name match (for league players not in mapping)
        let directLeagueMatches = getLeagueMatchesFromPlayer(leagueGames, playerNameLower);
        if (directLeagueMatches.length > 0) {
            processMatches(directLeagueMatches, "BiPo League", "BiPo League");
        }
    }

    // 3. Tournaments - combine all BiPo Open tournaments into one category
    let bipoOpenStats = { name: "BiPo Open Turniere", matches: 0, wins: 0, hits: 0, averageHits: 0 };
    for (let year of BIPO_OPEN_TOURNAMENT_YEARS) {
        let tournament = await getTournamentByName(year);
        if (!tournament) continue;
        let tMatches = getFinishedMatchesFromPlayer(tournament, playerName, false);
        let fallbackTime = getBiPoOpenTournamentFallbackTime(year);
        if (tMatches.length === 0) continue;

        tMatches.forEach(m => {
            let isTeam1 = m.team1.players.some(p => p.name === playerName);
            let t1Won = checkIfTeam1WonVsTeam2(m);
            let won: boolean = t1Won != null && (isTeam1 ? t1Won : !t1Won);
            if (won) bipoOpenStats.wins++;
            bipoOpenStats.matches++;
            let player = [...m.team1.players, ...m.team2.players].find(p => p.name === playerName);
            let hits = player ? player.score : 0;
            bipoOpenStats.hits += hits;
            let matchTime = m.time && m.time > 0 ? m.time : fallbackTime;
            matchHistory.push({ match: m, source: "BiPo Open Turniere", time: matchTime, won, hits });

            let opponents = isTeam1 ? m.team2.players : m.team1.players;
            let oppName = opponents.map(p => p.name).join(" & ");
            let rival = rivals.get(oppName) || { wins: 0, losses: 0 };
            if (won) rival.wins++; else rival.losses++;
            rivals.set(oppName, rival);

            let partnerName = getPartnerName(m, playerName);
            if (partnerName) {
                let p = partnersMap.get(partnerName) || { matches: 0, wins: 0, losses: 0 };
                p.matches++;
                if (won) p.wins++; else p.losses++;
                partnersMap.set(partnerName, p);
            }
        });
    }
    if (bipoOpenStats.matches > 0) {
        bipoOpenStats.averageHits = bipoOpenStats.hits / bipoOpenStats.matches;
        categories.push(bipoOpenStats);
    }

    matchHistory.sort((a, b) => b.time - a.time);

    // Filter match history by selected time period
    let filteredHistory = matchHistory;
    if (trendPeriod !== 'all') {
        let cutoff = Date.now() - TREND_PERIOD_DAYS[trendPeriod] * 24 * 60 * 60 * 1000;
        filteredHistory = matchHistory.filter(m => m.time > cutoff && m.time > 0);
    }

    // Recalculate categories from filtered history
    let filteredCategories: Map<string, CategoryStats> = new Map();
    filteredHistory.forEach(m => {
        let existing = filteredCategories.get(m.source) || { name: m.source, matches: 0, wins: 0, hits: 0, averageHits: 0 };
        existing.matches++;
        if (m.won) existing.wins++;
        existing.hits += m.hits;
        filteredCategories.set(m.source, existing);
    });
    let finalCategories = Array.from(filteredCategories.values()).map(c => {
        c.averageHits = c.matches > 0 ? c.hits / c.matches : 0;
        return c;
    });

    // Totals from filtered history
    let totalMatches = finalCategories.reduce((a, c) => a + c.matches, 0);
    let totalWins = finalCategories.reduce((a, c) => a + c.wins, 0);
    let totalHits = finalCategories.reduce((a, c) => a + c.hits, 0);

    let streaks = calculateStreaksFromResults(filteredHistory);
    let trends = trendPeriod === 'all'
        ? calculateTrends(matchHistory, '1m')
        : { winrateTrend: null, averageHitsTrend: null, totalMatchesTrend: null, totalHitsTrend: null, avg1v1Trend: null, avg2v2Trend: null };
    let { turnAnalysis, cupHeatmap } = analyzeTurns(filteredHistory, playerName);
    let extraStats = calculateExtraStatsFromResults(filteredHistory);
    extraStats.longestLosingStreak = streaks.longestLosing;

    let recentForm: ('W' | 'L')[] = filteredHistory
        .filter(m => m.time > 0)
        .slice(0, 10)
        .map(m => m.won ? 'W' : 'L');

    // Recalculate rivals and partners from filtered history
    let filteredRivals: Map<string, { wins: number; losses: number }> = new Map();
    let filteredPartners: Map<string, { matches: number; wins: number; losses: number }> = new Map();
    filteredHistory.forEach(({ match, won }) => {
        let effectiveName = leagueTeam && match.team1.players.some(p => p.name.toLowerCase() === leagueTeam!.toLowerCase()) || leagueTeam && match.team2.players.some(p => p.name.toLowerCase() === leagueTeam!.toLowerCase()) ? leagueTeam : playerName;
        let oppName = getOpponentName(match, effectiveName);
        let rival = filteredRivals.get(oppName) || { wins: 0, losses: 0 };
        if (won) rival.wins++; else rival.losses++;
        filteredRivals.set(oppName, rival);

        let partnerName = getPartnerName(match, effectiveName);
        if (partnerName) {
            let p = filteredPartners.get(partnerName) || { matches: 0, wins: 0, losses: 0 };
            p.matches++;
            if (won) p.wins++; else p.losses++;
            filteredPartners.set(partnerName, p);
        }
    });

    let rivalsList = Array.from(filteredRivals.entries())
        .map(([name, data]) => ({ name, wins: data.wins, losses: data.losses, matches: data.wins + data.losses }))
        .sort((a, b) => b.matches - a.matches)
        .slice(0, 5);

    let partnersList = Array.from(filteredPartners.entries())
        .map(([name, data]) => ({ name, matches: data.matches, wins: data.wins, losses: data.losses }))
        .sort((a, b) => b.matches - a.matches)
        .slice(0, 5);

    // Badges are always calculated from the full (unfiltered) match history
    let allTotalMatches = matchHistory.length;
    let allTotalWins = matchHistory.filter(m => m.won).length;
    let allTotalHits = matchHistory.reduce((a, m) => a + m.hits, 0);
    let firstGameTime = matchHistory
        .filter(m => m.time > 0)
        .reduce<number | null>((min, m) => (min === null || m.time < min ? m.time : min), null);
    let allWinrate = allTotalMatches > 0 ? Math.round((allTotalWins / allTotalMatches) * 100) : 0;
    let allStreaks = calculateStreaksFromResults(matchHistory);
    let badges = await calculateBadges({ playerName, allMatchHistory: matchHistory, totalMatches: allTotalMatches, totalWins: allTotalWins, bestWinStreak: allStreaks.best, totalHits: allTotalHits, winrate: allWinrate });

    return {
        name: playerName,
        leagueTeam,
        firstGameTime,
        totalMatches,
        totalWins,
        totalLosses: totalMatches - totalWins,
        winrate: totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0,
        totalHits,
        averageHits: totalMatches > 0 ? Math.round((totalHits / totalMatches) * 100) / 100 : 0,
        currentWinStreak: streaks.current,
        bestWinStreak: streaks.best,
        trends,
        categories: finalCategories,
        recentForm,
        matchHistory: filteredHistory,
        rivals: rivalsList,
        partners: partnersList,
        turnAnalysis,
        cupHeatmap,
        extraStats,
        badges,
    };
};
