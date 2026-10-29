import { filterLeagueGames, getGameLeague, getLeagueList, isCupGame } from '@/components/frontend/league/LeagueUtilFunctions';
import { LEAGUE_SEASONS, LeagueDivision, getRegularSeasonGameCount, toLeaguePlayers } from '@/components/frontend/league/LeagueSeasonsData';
import { getPlayerForLeagueTeam } from '@/components/frontend/league/LeaguePlayersData';
import { getCupGames, getCupRoundGames, getPairingResult } from '@/components/frontend/league/cup/LeagueCupUtilFunctions';
import { checkIfMatchFinished, checkIfTeam1WonVsTeam2 } from '@/util/tournamentMatchFunctions';

////////////////////////
// PUNKTESYSTEM       //
////////////////////////
export type RankingCategory = 'tournament' | 'league' | 'cup' | 'open';

export const RANKING_CATEGORIES: { key: RankingCategory; label: string; title: string; letter: string; color: string }[] = [
    { key: 'tournament', label: 'Turnier', title: 'Turnier · BiPo Open', letter: 'T', color: '#E0A82E' },
    { key: 'league', label: 'Liga', title: 'BiPo League', letter: 'L', color: '#2AA3B8' },
    { key: 'cup', label: 'Cup', title: 'League Cup', letter: 'C', color: '#EA5160' },
    { key: 'open', label: 'Offen', title: 'Offene Spiele', letter: 'O', color: '#4B5568' },
];

export const RANKING_WINDOW_DAYS = 365;
// Wer weniger Spiele im Zeitraum hat, taucht nicht in der Rangliste auf (Einmal-Turnierspieler).
export const RANKING_MIN_GAMES = 5;
// Auf-/Abstiegspfeile: Vergleich mit der Rangliste von vor so vielen Tagen.
export const RANKING_TREND_DAYS = 7;

export const TOURNAMENT_POINTS = {
    win: 150,
    final: 100,
    semiFinal: 70,
    thirdPlaceBonus: 10,
    quarterFinal: 45,
    roundOf16: 25,
    groupWin: 10,
};

type LeaguePoints = { win: number; loss: number; places: number[]; regularSeasonWinner: number };

// places: Meister, 2., 3., 4. Platz (Final Four)
export const LEAGUE_POINTS: Record<number, LeaguePoints> = {
    1: { win: 6, loss: 0, places: [60, 35, 20, 10], regularSeasonWinner: 10 },
    2: { win: 4, loss: 0, places: [30, 20, 10, 0], regularSeasonWinner: 0 },
};

export const CUP_POINTS = {
    firstRound: 5,
    laterRound: 10, // 2. Runde und alle weiteren Runden vor dem Viertelfinale
    quarterFinal: 15,
    semiFinal: 25,
    final: 40,
};

export const OPEN_GAME_POINTS = {
    win: 2,
    maxWins: 40,
};

export type PointsSystemSection = { category: RankingCategory; title: string; rows: { label: string; value: string }[] };

// Fuer das Punktesystem-Sheet, damit Anzeige und Berechnung dieselben Werte nutzen.
export const POINTS_SYSTEM_SECTIONS: PointsSystemSection[] = [
    {
        category: 'tournament',
        title: 'Turnier · BiPo Open',
        rows: [
            { label: 'Turniersieg', value: `${TOURNAMENT_POINTS.win}` },
            { label: 'Finale', value: `${TOURNAMENT_POINTS.final}` },
            { label: 'Halbfinale', value: `${TOURNAMENT_POINTS.semiFinal}` },
            { label: 'Spiel um Platz 3 gewonnen', value: `+${TOURNAMENT_POINTS.thirdPlaceBonus}` },
            { label: 'Viertelfinale', value: `${TOURNAMENT_POINTS.quarterFinal}` },
            { label: 'Achtelfinale', value: `${TOURNAMENT_POINTS.roundOf16}` },
            { label: 'Sieg in der Gruppenphase', value: `je ${TOURNAMENT_POINTS.groupWin}` },
        ],
    },
    ...[1, 2].map((league): PointsSystemSection => {
        const points = LEAGUE_POINTS[league];
        return {
            category: 'league',
            title: `BiPo League · ${league}. Liga`,
            rows: [
                { label: 'Sieg', value: `${points.win}` },
                ...(points.loss ? [{ label: 'Niederlage (dabei sein zählt)', value: `${points.loss}` }] : []),
                { label: 'Meister', value: `${points.places[0]}` },
                { label: '2. Platz', value: `${points.places[1]}` },
                { label: '3. Platz', value: `${points.places[2]}` },
                ...(points.places[3] ? [{ label: '4. Platz', value: `${points.places[3]}` }] : []),
                ...(points.regularSeasonWinner ? [{ label: 'Erster der Hauptrunde', value: `+${points.regularSeasonWinner}` }] : []),
            ],
        };
    }),
    {
        category: 'cup',
        title: 'League Cup',
        rows: [
            { label: '1. Runde gewonnen', value: `${CUP_POINTS.firstRound}` },
            { label: '2. Runde gewonnen', value: `${CUP_POINTS.laterRound}` },
            { label: 'Viertelfinale gewonnen', value: `${CUP_POINTS.quarterFinal}` },
            { label: 'Halbfinale gewonnen', value: `${CUP_POINTS.semiFinal}` },
            { label: 'Finale gewonnen · Cup-Sieg', value: `${CUP_POINTS.final}` },
        ],
    },
    {
        category: 'open',
        title: 'Offene Spiele',
        rows: [
            { label: 'Sieg', value: `${OPEN_GAME_POINTS.win}` },
            { label: 'Gewertete Siege in 12 Monaten', value: `max. ${OPEN_GAME_POINTS.maxWins}` },
        ],
    },
];

////////////////////////
// PUNKTE-EREIGNISSE  //
////////////////////////
// Alle Daten werden einmal in Ereignisse (Spieler, Punkte, Zeitpunkt) umgerechnet. Die Rangliste fuer einen
// Stichtag filtert dann nur noch nach Zeitraum, so kostet die Rangliste von vor 7 Tagen (Trend) kaum etwas.
type PointEvent = { player: string; category: RankingCategory; points: number; time: number };
type GameEvent = { player: string; time: number };

export type RankingTournament = { tournament: Tournament; time: number };

export type RankingData = {
    openGames: Match[];
    leagueGames: Match[];
    leagueCups: LeagueCup[];
    tournaments: RankingTournament[];
};

export type RankingEvents = { points: PointEvent[]; games: GameEvent[]; displayNames: Record<string, string> };

const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();

const getTeamScore = (team: Team) => team.players.reduce((acc, player) => acc + (player.score ?? 0), 0);

export const buildRankingEvents = (data: RankingData): RankingEvents => {
    const points: PointEvent[] = [];
    const games: GameEvent[] = [];
    const spellings: Record<string, Record<string, number>> = {};

    // Liga-/Cup-Spiele speichern den Teamnamen, gewertet wird der Spieler dahinter.
    const toPlayerKey = (name: string) => {
        const playerName = (getPlayerForLeagueTeam(name) ?? name).trim().replace(/\s+/g, ' ');
        const key = normalizeName(playerName);
        spellings[key] ??= {};
        spellings[key][playerName] = (spellings[key][playerName] ?? 0) + 1;
        return key;
    };

    const addPoints = (name: string, category: RankingCategory, value: number, time: number) => {
        if (value) points.push({ player: toPlayerKey(name), category, points: value, time });
    };
    const addGame = (match: Match, time: number) => {
        [...match.team1.players, ...match.team2.players].forEach(player => games.push({ player: toPlayerKey(player.name), time }));
    };

    addOpenGameEvents(data.openGames, addPoints, addGame);
    addLeagueGameEvents(data.leagueGames, addPoints, addGame);
    addLeagueBonusEvents(data.leagueGames, addPoints);
    data.leagueCups.forEach(leagueCup => addCupEvents(data.leagueGames, leagueCup, addPoints));
    data.tournaments.forEach(({ tournament, time }) => addTournamentEvents(tournament, time, addPoints, addGame));

    // Anzeigename = haeufigste Schreibweise
    const displayNames = Object.fromEntries(Object.entries(spellings).map(([key, counts]) =>
        [key, Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]]
    ));

    return { points, games, displayNames };
};

type AddPoints = (name: string, category: RankingCategory, value: number, time: number) => void;
type AddGame = (match: Match, time: number) => void;

const addOpenGameEvents = (openGames: Match[], addPoints: AddPoints, addGame: AddGame) => {
    openGames
        .filter(match => match.time)
        .forEach(match => {
            const time = match.time!;
            addGame(match, time);

            const team1Score = getTeamScore(match.team1);
            const team2Score = getTeamScore(match.team2);
            if (team1Score === team2Score) return;

            const winner = team1Score > team2Score ? match.team1 : match.team2;
            winner.players.forEach(player => addPoints(player.name, 'open', OPEN_GAME_POINTS.win, time));
        });
};

const addLeagueGameEvents = (leagueGames: Match[], addPoints: AddPoints, addGame: AddGame) => {
    leagueGames
        .filter(match => match.time && match.team1.players.length === 1 && match.team2.players.length === 1)
        .forEach(match => {
            const time = match.time!;
            addGame(match, time);

            // Pokalspiele zaehlen nur ueber die Cup-Rundenpunkte
            if (isCupGame(match)) return;

            const points = LEAGUE_POINTS[getGameLeague(match)] ?? LEAGUE_POINTS[1];
            const team1Won = getTeamScore(match.team1) > getTeamScore(match.team2);
            addPoints(match.team1.players[0].name, 'league', team1Won ? points.win : points.loss, time);
            addPoints(match.team2.players[0].name, 'league', team1Won ? points.loss : points.win, time);
        });
};

// Final Four wie in LeagueFinalFour.vue: nach der Hauptrunde 1-4 und 2-3 im Best-of-3, dann Finale und Spiel um Platz 3.
const getSeriesResult = (finalFourGames: Match[], team1: string, team2: string) => {
    const games = finalFourGames
        .filter(match => {
            const names = [match.team1.players[0].name, match.team2.players[0].name].map(normalizeName);
            return names.includes(normalizeName(team1)) && names.includes(normalizeName(team2));
        })
        .slice(0, 3);

    let team1Wins = 0;
    let team2Wins = 0;
    for (const match of games) {
        if (team1Wins >= 2 || team2Wins >= 2) break;
        const team1Score = getTeamScore(match.team1);
        const team2Score = getTeamScore(match.team2);
        if (team1Score === team2Score) continue;

        const matchUsesTeam1 = normalizeName(match.team1.players[0].name) === normalizeName(team1);
        if (matchUsesTeam1 === (team1Score > team2Score)) team1Wins++;
        else team2Wins++;
    }

    const time = Math.max(0, ...games.map(match => match.time ?? 0));
    if (team1Wins >= 2) return { winner: team1, loser: team2, time };
    if (team2Wins >= 2) return { winner: team2, loser: team1, time };
    return undefined;
};

const addLeagueBonusEvents = (leagueGames: Match[], addPoints: AddPoints) => {
    LEAGUE_SEASONS.forEach(season => {
        season.divisions.forEach((division: LeagueDivision) => {
            const points = LEAGUE_POINTS[division.league] ?? LEAGUE_POINTS[1];
            const regularSeasonGameCount = getRegularSeasonGameCount(division);
            const games = filterLeagueGames(leagueGames, season.slug, division.league)
                .filter(match => match.time)
                .sort((match1, match2) => match1.time! - match2.time!);

            if (!regularSeasonGameCount || games.length < regularSeasonGameCount) return;

            const regularSeasonGames = games.slice(0, regularSeasonGameCount);
            const standings = getLeagueList(regularSeasonGames, toLeaguePlayers(division.teams));
            const regularSeasonEnd = regularSeasonGames[regularSeasonGames.length - 1].time!;
            addPoints(standings[0].name, 'league', points.regularSeasonWinner, regularSeasonEnd);

            if (!division.hasFinalFour || standings.length < 4) return;

            const finalFourGames = games.slice(regularSeasonGameCount);
            const [seed1, seed2, seed3, seed4] = standings.map(player => player.name);
            const semiFinal1 = getSeriesResult(finalFourGames, seed1, seed4);
            const semiFinal2 = getSeriesResult(finalFourGames, seed2, seed3);
            if (!semiFinal1 || !semiFinal2) return;

            const final = getSeriesResult(finalFourGames, semiFinal1.winner, semiFinal2.winner);
            if (final) {
                addPoints(final.winner, 'league', points.places[0], final.time);
                addPoints(final.loser, 'league', points.places[1], final.time);
            }

            const thirdPlace = getSeriesResult(finalFourGames, semiFinal1.loser, semiFinal2.loser);
            if (thirdPlace) {
                addPoints(thirdPlace.winner, 'league', points.places[2], thirdPlace.time);
                addPoints(thirdPlace.loser, 'league', points.places[3], thirdPlace.time);
            }
        });
    });
};

const getCupRoundPoints = (roundName: string, roundIndex: number) => {
    if (roundName === 'Finale') return CUP_POINTS.final;
    if (roundName === 'Halbfinale') return CUP_POINTS.semiFinal;
    if (roundName === 'Viertelfinale') return CUP_POINTS.quarterFinal;
    return roundIndex === 0 ? CUP_POINTS.firstRound : CUP_POINTS.laterRound;
};

const addCupEvents = (leagueGames: Match[], leagueCup: LeagueCup, addPoints: AddPoints) => {
    const cupGames = getCupGames(leagueGames, leagueCup);

    leagueCup.rounds.forEach((round, roundIndex) => {
        const roundGames = getCupRoundGames(cupGames, roundIndex);
        round.pairings.forEach(pairing => {
            const { winner, games } = getPairingResult(pairing, roundGames, round.bestOf);
            if (!winner) return;
            const time = Math.max(0, ...games.map(match => match.time ?? 0));
            addPoints(winner, 'cup', getCupRoundPoints(round.name, roundIndex), time);
        });
    });
};

const addTournamentEvents = (tournament: Tournament, time: number, addPoints: AddPoints, addGame: AddGame) => {
    const addTeamPoints = (team: Team, value: number) =>
        team.players.forEach(player => addPoints(player.name, 'tournament', value, time));

    // Gruppenphase
    tournament.groupPhase.matches.flat().forEach(match => {
        if (!checkIfMatchFinished(match)) return;
        addGame(match, time);
        const team1Won = checkIfTeam1WonVsTeam2(match);
        if (team1Won !== undefined) addTeamPoints(team1Won ? match.team1 : match.team2, TOURNAMENT_POINTS.groupWin);
    });

    // K.o.-Phase: gewertet wird die hoechste erreichte Runde. Letzte Runde = [Finale, Spiel um Platz 3].
    const koRounds = tournament.koPhase.matches;
    const lastRoundIndex = koRounds.length - 1;
    const teams = new Map<string, { team: Team; roundIndex: number }>();

    koRounds.forEach((round, roundIndex) => round.forEach(match => {
        if (checkIfMatchFinished(match)) addGame(match, time);
        [match.team1, match.team2].forEach(team => {
            if (team?._id) teams.set(team._id, { team, roundIndex });
        });
    }));

    const [finalMatch, thirdPlaceMatch] = koRounds[lastRoundIndex] ?? [];
    const isInMatch = (match: Match | undefined, team: Team) => !!match && (match.team1?._id === team._id || match.team2?._id === team._id);
    const isMatchWinner = (match: Match, team: Team) => {
        const team1Won = checkIfTeam1WonVsTeam2(match);
        return team1Won !== undefined && (team1Won ? match.team1 : match.team2)._id === team._id;
    };

    teams.forEach(({ team, roundIndex }) => {
        let value = 0;
        if (isInMatch(finalMatch, team))
            value = isMatchWinner(finalMatch, team) ? TOURNAMENT_POINTS.win : TOURNAMENT_POINTS.final;
        else if (isInMatch(thirdPlaceMatch, team))
            value = TOURNAMENT_POINTS.semiFinal + (isMatchWinner(thirdPlaceMatch, team) ? TOURNAMENT_POINTS.thirdPlaceBonus : 0);
        else if (roundIndex === lastRoundIndex - 1)
            value = TOURNAMENT_POINTS.semiFinal;
        else if (roundIndex === lastRoundIndex - 2)
            value = TOURNAMENT_POINTS.quarterFinal;
        else if (roundIndex === lastRoundIndex - 3)
            value = TOURNAMENT_POINTS.roundOf16;
        addTeamPoints(team, value);
    });
};

////////////////////////
// RANGLISTE          //
////////////////////////
export type RankingView = 'total' | RankingCategory;

export type WorldRankingEntry = {
    key: string;
    name: string;
    rank: number;
    total: number;
    points: Record<RankingCategory, number>;
    games: number;
    // Platzveraenderung zum Stand vor RANKING_TREND_DAYS Tagen. null = damals noch nicht in der Rangliste.
    trend: number | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

const emptyPoints = (): Record<RankingCategory, number> => ({ tournament: 0, league: 0, cup: 0, open: 0 });

const getRankingAt = (events: RankingEvents, referenceTime: number, view: RankingView) => {
    const from = referenceTime - RANKING_WINDOW_DAYS * DAY_MS;
    const inWindow = (time: number) => time > from && time <= referenceTime;

    const games: Record<string, number> = {};
    events.games.forEach(event => {
        if (inWindow(event.time)) games[event.player] = (games[event.player] ?? 0) + 1;
    });

    const pointsByPlayer: Record<string, Record<RankingCategory, number>> = {};
    events.points.forEach(event => {
        if (!inWindow(event.time)) return;
        pointsByPlayer[event.player] ??= emptyPoints();
        pointsByPlayer[event.player][event.category] += event.points;
    });

    const entries: Omit<WorldRankingEntry, 'rank' | 'trend'>[] = [];

    Object.entries(pointsByPlayer).forEach(([player, playerPoints]) => {
        if ((games[player] ?? 0) < RANKING_MIN_GAMES) return;

        const points = { ...playerPoints };
        points.open = Math.min(points.open, OPEN_GAME_POINTS.maxWins * OPEN_GAME_POINTS.win);

        const total = points.tournament + points.league + points.cup + points.open;
        const score = view === 'total' ? total : points[view];
        if (score <= 0) return;

        entries.push({ key: player, name: events.displayNames[player] ?? player, total, points, games: games[player] });
    });

    const getScore = (entry: Omit<WorldRankingEntry, 'rank' | 'trend'>) => view === 'total' ? entry.total : entry.points[view];
    entries.sort((entry1, entry2) => getScore(entry2) - getScore(entry1) || entry1.name.localeCompare(entry2.name));

    // Punktgleich = gleicher Platz (1, 2, 2, 4)
    let rank = 0;
    return entries.map((entry, index) => {
        if (index === 0 || getScore(entries[index - 1]) !== getScore(entry)) rank = index + 1;
        return { ...entry, rank };
    });
};

export const getWorldRanking = (events: RankingEvents, referenceTime: number, view: RankingView): WorldRankingEntry[] => {
    const current = getRankingAt(events, referenceTime, view);
    const previous = getRankingAt(events, referenceTime - RANKING_TREND_DAYS * DAY_MS, view);
    const previousRanks = new Map(previous.map(entry => [entry.key, entry.rank]));

    return current.map(entry => {
        const previousRank = previousRanks.get(entry.key);
        return { ...entry, trend: previousRank === undefined ? null : previousRank - entry.rank };
    });
};
