import { getAllOpenGames, getMatchesFromPlayer as getOpenGameMatchesFromPlayer } from "@/components/frontend/openGames/OpenGamesUtilFunctions";
import { getAllLeagueGames, getMatchesFromPlayer as getLeagueMatchesFromPlayer } from "@/components/frontend/league/LeagueUtilFunctions";
import { getTournamentByName } from "@/util/tournamentFunctions";
import { getFinishedMatchesFromPlayer } from "@/util/tournamentPlayerFunctions";
import { checkIfTeam1WonVsTeam2 } from "@/util/tournamentMatchFunctions";
import { getLeagueTeamForPlayer } from "./LeaguePlayerMapping";

export type TrendData = {
    winrateTrend: number | null;
    averageHitsTrend: number | null;
};

export type CategoryStats = {
    name: string;
    matches: number;
    wins: number;
    hits: number;
    averageHits: number;
};

export type TurnAnalysis = {
    hit: number;
    miss: number;
    airball: number;
    bomb: number;
    bouncer: number;
    trickshot: number;
    onfire: number;
    ballsback: number;
    lastCup: number;
    total: number;
};

export type CupHeatmap = number[]; // index 0-9, count of hits per cup

export type PartnerData = {
    name: string;
    matches: number;
    wins: number;
};

export type ExtraStats = {
    fastestWinMinutes: number | null;
    bestTimeOfDay: string | null;   // e.g. "20-22 Uhr"
    bestTimeWinrate: number | null;
    longestLosingStreak: number;
};

export type PlayerProfileData = {
    name: string;
    leagueTeam: string | null;
    totalMatches: number;
    totalWins: number;
    totalLosses: number;
    winrate: number;
    totalHits: number;
    averageHits: number;
    currentWinStreak: number;
    bestWinStreak: number;
    trends: TrendData;
    categories: CategoryStats[];
    recentForm: ('W' | 'L')[];
    matchHistory: { match: Match; source: string; time: number }[];
    rivals: { name: string; wins: number; losses: number; matches: number }[];
    partners: PartnerData[];
    turnAnalysis: TurnAnalysis;
    cupHeatmap: CupHeatmap;
    extraStats: ExtraStats;
};

export const getAllPlayerNames = async (): Promise<string[]> => {
    let allNames: Set<string> = new Set();

    let openGames = await getAllOpenGames();
    openGames.forEach(game => {
        [...game.team1.players, ...game.team2.players].forEach(p => {
            allNames.add(formatName(p.name));
        });
    });

    let leagueGames = await getAllLeagueGames();
    leagueGames.forEach(game => {
        [...game.team1.players, ...game.team2.players].forEach(p => {
            allNames.add(formatName(p.name));
        });
    });

    let tournamentYears = ["2020", "2022", "2023", "2024", "2025"];
    for (let year of tournamentYears) {
        let tournament = await getTournamentByName(year);
        if (tournament) {
            tournament.teams.forEach(team => {
                team.players.forEach(p => allNames.add(p.name));
            });
        }
    }

    return Array.from(allNames).sort();
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

const calculateTrends = (matchHistory: { match: Match; time: number }[], playerName: string): TrendData => {
    let now = Date.now();
    let thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    let recent = matchHistory.filter(m => m.time > thirtyDaysAgo && m.time > 0);
    let older = matchHistory.filter(m => m.time > 0 && m.time <= thirtyDaysAgo);

    if (recent.length < 3 || older.length < 3) return { winrateTrend: null, averageHitsTrend: null };

    let rWr = Math.round(recent.filter(m => didPlayerWinMatch(m.match, playerName)).length / recent.length * 100);
    let oWr = Math.round(older.filter(m => didPlayerWinMatch(m.match, playerName)).length / older.length * 100);
    let rAvg = recent.reduce((a, m) => a + getPlayerHitsInMatch(m.match, playerName), 0) / recent.length;
    let oAvg = older.reduce((a, m) => a + getPlayerHitsInMatch(m.match, playerName), 0) / older.length;

    return {
        winrateTrend: rWr - oWr,
        averageHitsTrend: Math.round((rAvg - oAvg) * 100) / 100,
    };
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

    // Best time of day (2h blocks)
    let timeBlocks: Map<string, { wins: number; total: number }> = new Map();
    matchHistory.forEach(({ match, time }) => {
        if (!time || time === 0) return;
        let hour = new Date(time).getHours();
        let blockStart = Math.floor(hour / 2) * 2;
        let blockKey = `${blockStart}-${blockStart + 2} Uhr`;
        let block = timeBlocks.get(blockKey) || { wins: 0, total: 0 };
        block.total++;
        if (didPlayerWinMatch(match, playerName)) block.wins++;
        timeBlocks.set(blockKey, block);
    });

    let bestTimeOfDay: string | null = null;
    let bestTimeWinrate: number | null = null;
    timeBlocks.forEach((block, key) => {
        if (block.total < 3) return;
        let wr = Math.round(block.wins / block.total * 100);
        if (bestTimeWinrate === null || wr > bestTimeWinrate) {
            bestTimeWinrate = wr;
            bestTimeOfDay = key;
        }
    });

    return { fastestWinMinutes, bestTimeOfDay, bestTimeWinrate, longestLosingStreak: 0 };
};

export const getPlayerProfileData = async (playerName: string): Promise<PlayerProfileData> => {
    let playerNameLower = playerName.toLowerCase();
    let matchHistory: { match: Match; source: string; time: number }[] = [];
    let rivals: Map<string, { wins: number; losses: number }> = new Map();
    let partnersMap: Map<string, { matches: number; wins: number }> = new Map();
    let categories: CategoryStats[] = [];

    const processMatches = (matches: Match[], source: string, categoryName: string) => {
        let stats = { name: categoryName, matches: matches.length, wins: 0, hits: 0, averageHits: 0 };
        matches.forEach(m => {
            let won = didPlayerWinMatch(m, playerName);
            if (won) stats.wins++;
            stats.hits += getPlayerHitsInMatch(m, playerName);
            matchHistory.push({ match: m, source, time: m.time || 0 });

            let oppName = getOpponentName(m, playerName);
            let rival = rivals.get(oppName) || { wins: 0, losses: 0 };
            if (won) rival.wins++; else rival.losses++;
            rivals.set(oppName, rival);

            let partnerName = getPartnerName(m, playerName);
            if (partnerName) {
                let p = partnersMap.get(partnerName) || { matches: 0, wins: 0 };
                p.matches++;
                if (won) p.wins++;
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
        let leagueStats = { name: "BiPo League", matches: leagueMatches.length, wins: 0, hits: 0, averageHits: 0 };
        leagueMatches.forEach(m => {
            let won = didPlayerWinMatch(m, leagueTeam!);
            if (won) leagueStats.wins++;
            leagueStats.hits += getPlayerHitsInMatch(m, leagueTeam!);
            matchHistory.push({ match: m, source: "BiPo League", time: m.time || 0 });
        });
        leagueStats.averageHits = leagueStats.matches > 0 ? leagueStats.hits / leagueStats.matches : 0;
        if (leagueStats.matches > 0) categories.push(leagueStats);
    } else {
        // Fallback: try direct name match (for league players not in mapping)
        let directLeagueMatches = getLeagueMatchesFromPlayer(leagueGames, playerNameLower);
        if (directLeagueMatches.length > 0) {
            processMatches(directLeagueMatches, "BiPo League", "BiPo League");
        }
    }

    // 3. Tournaments
    let tournamentYears = ["2020", "2022", "2023", "2024", "2025"];
    for (let year of tournamentYears) {
        let tournament = await getTournamentByName(year);
        if (!tournament) continue;
        let tMatches = getFinishedMatchesFromPlayer(tournament, playerName, false);
        if (tMatches.length === 0) continue;

        let tStats = { name: tournament.name, matches: tMatches.length, wins: 0, hits: 0, averageHits: 0 };
        tMatches.forEach(m => {
            let isTeam1 = m.team1.players.some(p => p.name === playerName);
            let won = isTeam1 ? checkIfTeam1WonVsTeam2(m) : !checkIfTeam1WonVsTeam2(m);
            if (won) tStats.wins++;
            let player = [...m.team1.players, ...m.team2.players].find(p => p.name === playerName);
            if (player) tStats.hits += player.score;
            matchHistory.push({ match: m, source: tournament.name, time: m.time || 0 });

            let opponents = isTeam1 ? m.team2.players : m.team1.players;
            let oppName = opponents.map(p => p.name).join(" & ");
            let rival = rivals.get(oppName) || { wins: 0, losses: 0 };
            if (won) rival.wins++; else rival.losses++;
            rivals.set(oppName, rival);

            let partnerName = getPartnerName(m, playerName);
            if (partnerName) {
                let p = partnersMap.get(partnerName) || { matches: 0, wins: 0 };
                p.matches++;
                if (won) p.wins++;
                partnersMap.set(partnerName, p);
            }
        });
        tStats.averageHits = tStats.matches > 0 ? tStats.hits / tStats.matches : 0;
        categories.push(tStats);
    }

    // Totals
    let totalMatches = categories.reduce((a, c) => a + c.matches, 0);
    let totalWins = categories.reduce((a, c) => a + c.wins, 0);
    let totalHits = categories.reduce((a, c) => a + c.hits, 0);

    matchHistory.sort((a, b) => b.time - a.time);

    let streaks = calculateStreaks(matchHistory, playerName);
    let trends = calculateTrends(matchHistory, playerName);
    let { turnAnalysis, cupHeatmap } = analyzeTurns(matchHistory, playerName);
    let extraStats = calculateExtraStats(matchHistory, playerName);
    extraStats.longestLosingStreak = streaks.longestLosing;

    let recentForm: ('W' | 'L')[] = matchHistory
        .filter(m => m.time > 0)
        .slice(0, 10)
        .map(m => didPlayerWinMatch(m.match, playerName) ? 'W' : 'L');

    let rivalsList = Array.from(rivals.entries())
        .map(([name, data]) => ({ name, wins: data.wins, losses: data.losses, matches: data.wins + data.losses }))
        .sort((a, b) => b.matches - a.matches)
        .slice(0, 5);

    let partnersList = Array.from(partnersMap.entries())
        .map(([name, data]) => ({ name, matches: data.matches, wins: data.wins }))
        .sort((a, b) => b.matches - a.matches)
        .slice(0, 5);

    return {
        name: playerName,
        leagueTeam,
        totalMatches,
        totalWins,
        totalLosses: totalMatches - totalWins,
        winrate: totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0,
        totalHits,
        averageHits: totalMatches > 0 ? Math.round((totalHits / totalMatches) * 100) / 100 : 0,
        currentWinStreak: streaks.current,
        bestWinStreak: streaks.best,
        trends,
        categories,
        recentForm,
        matchHistory,
        rivals: rivalsList,
        partners: partnersList,
        turnAnalysis,
        cupHeatmap,
        extraStats,
    };
};
