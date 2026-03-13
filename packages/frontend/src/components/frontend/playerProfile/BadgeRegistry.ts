import { getTournamentByName } from "@/util/tournamentFunctions";
import { checkIfTeam1WonVsTeam2, checkIfMatchFinished } from "@/util/tournamentMatchFunctions";
import { BIPO_OPEN_TOURNAMENT_YEARS } from "@/util/bipoOpenTournamentMeta";

export interface BadgeContext {
    playerName: string;
    allMatchHistory: { match: Match; time: number; won: boolean; hits: number; source: string }[];
    totalMatches: number;
    totalWins: number;
    bestWinStreak: number;
    totalHits: number;
    winrate: number;
}

export type BadgeChecker = (ctx: BadgeContext) => Promise<PlayerBadge[]> | PlayerBadge[];

const registry: BadgeChecker[] = [];

export const registerBadge = (checker: BadgeChecker) => registry.push(checker);

export const calculateBadges = async (ctx: BadgeContext): Promise<PlayerBadge[]> => {
    let results: PlayerBadge[] = [];
    for (let checker of registry) {
        let r = await checker(ctx);
        results.push(...r);
    }
    return results;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const dateStr = (ts: number) => ts > 0 ? new Date(ts).toLocaleDateString('de-DE') : null;

const findMilestoneMatch = (history: BadgeContext['allMatchHistory'], count: number) => {
    let sorted = [...history].filter(m => m.time > 0).sort((a, b) => a.time - b.time);
    return sorted.length >= count ? sorted[count - 1] : null;
};

const findWinMilestoneMatch = (history: BadgeContext['allMatchHistory'], count: number) => {
    let sorted = [...history].filter(m => m.time > 0).sort((a, b) => a.time - b.time);
    let wins = 0;
    for (let m of sorted) {
        if (m.won) wins++;
        if (wins >= count) return m;
    }
    return null;
};

const findHitMilestoneMatch = (history: BadgeContext['allMatchHistory'], count: number) => {
    let sorted = [...history].filter(m => m.time > 0).sort((a, b) => a.time - b.time);
    let hits = 0;
    for (let m of sorted) {
        hits += m.hits;
        if (hits >= count) return m;
    }
    return null;
};

// ─── Default Badge Registrations ──────────────────────────────────────────────

// Turniersieg
registerBadge(async ({ playerName }) => {
    let badges: PlayerBadge[] = [];
    for (let year of BIPO_OPEN_TOURNAMENT_YEARS) {
        let tournament = await getTournamentByName(year);
        if (!tournament?.koPhase.matches.length) continue;
        let lastStage = tournament.koPhase.matches[tournament.koPhase.matches.length - 1];
        let finalMatch = lastStage[0];
        if (!finalMatch || !checkIfMatchFinished(finalMatch)) continue;
        let team1Won = checkIfTeam1WonVsTeam2(finalMatch);
        let winningTeam = team1Won ? finalMatch.team1 : finalMatch.team2;
        if (winningTeam.players.some(p => p.name === playerName)) {
            badges.push({
                id: `tournament-win-${year}`,
                icon: 'emoji_events',
                label: `BiPo Open ${year} Sieger`,
                description: `Gewinner des BiPo Open ${year} Turniers`,
                date: dateStr(finalMatch.time || 0),
                priority: 1000,
                special: 'rainbow',
            });
        }
    }
    return badges;
});

// Spiele-Meilensteine
registerBadge(({ allMatchHistory, totalMatches }) => {
    let milestones = [
        { count: 100, icon: 'star', label: 'Stammgast', desc: '100 Spiele absolviert' },
        { count: 200, icon: 'military_tech', label: 'Veteran', desc: '200 Spiele absolviert' },
        { count: 300, icon: 'workspace_premium', label: 'Legende', desc: '300 Spiele absolviert' },
        { count: 500, icon: 'diamond', label: 'Unstoppable', desc: '500 Spiele absolviert' },
    ];
    return milestones
        .filter(m => totalMatches >= m.count)
        .map(m => {
            let milestone = findMilestoneMatch(allMatchHistory, m.count);
            return { id: `matches-${m.count}`, icon: m.icon, label: m.label, description: m.desc, date: milestone ? dateStr(milestone.time) : null };
        });
});

// Sieg-Meilensteine
registerBadge(({ allMatchHistory, totalWins }) => {
    let milestones = [
        { count: 100, icon: 'local_fire_department', label: 'Dominator', desc: '100 Siege errungen' },
        { count: 200, icon: 'whatshot', label: 'Unbesiegbar', desc: '200 Siege errungen' },
    ];
    return milestones
        .filter(m => totalWins >= m.count)
        .map(m => {
            let milestone = findWinMilestoneMatch(allMatchHistory, m.count);
            return { id: `wins-${m.count}`, icon: m.icon, label: m.label, description: m.desc, date: milestone ? dateStr(milestone.time) : null };
        });
});

// Treffer-Meilensteine
registerBadge(({ allMatchHistory, totalHits }) => {
    let milestones = [
        { count: 500, icon: 'track_changes', label: 'Präzisionsmaschine', desc: '500 Treffer erzielt' },
        { count: 1000, icon: 'crisis_alert', label: 'Tausender', desc: '1.000 Treffer erzielt' },
    ];
    return milestones
        .filter(m => totalHits >= m.count)
        .map(m => {
            let milestone = findHitMilestoneMatch(allMatchHistory, m.count);
            return { id: `hits-${m.count}`, icon: m.icon, label: m.label, description: m.desc, date: milestone ? dateStr(milestone.time) : null };
        });
});

// Siegesserien
registerBadge(({ bestWinStreak }) => {
    let badges: PlayerBadge[] = [];
    if (bestWinStreak >= 15) badges.push({ id: 'streak-15', icon: 'bolt', label: 'Hot Streak', description: '15 Siege in Folge', date: null });
    if (bestWinStreak >= 20) badges.push({ id: 'streak-20', icon: 'electric_bolt', label: 'King of the Hill', description: '20 Siege in Folge', date: null });
    return badges;
});

// Siegquote
registerBadge(({ totalMatches, winrate }) => {
    let badges: PlayerBadge[] = [];
    if (totalMatches >= 20 && winrate >= 60) badges.push({ id: 'winrate-60', icon: 'trending_up', label: 'Überdurchschnittlich', description: 'Siegquote über 60% (mind. 20 Spiele)', date: null });
    if (totalMatches >= 20 && winrate >= 75) badges.push({ id: 'winrate-75', icon: 'rocket_launch', label: 'Elite', description: 'Siegquote über 75% (mind. 20 Spiele)', date: null });
    return badges;
});

// Perfect Game – nur in 2v2, da im 1v1 man sowieso immer 10 Treffer macht
// registerBadge(({ allMatchHistory }) => {
//     let perfectGame = allMatchHistory.find(m => {
//         if (m.hits < 10) return false;
//         let is1v1 = m.match.team1.players.length === 1 && m.match.team2.players.length === 1;
//         return !is1v1;
//     });
//     if (!perfectGame) return [];
//     return [{ id: 'perfect-game', icon: 'auto_awesome', label: 'Perfect Game', description: '10+ Treffer in einem 2v2 Spiel', date: dateStr(perfectGame.time) }];
// });
