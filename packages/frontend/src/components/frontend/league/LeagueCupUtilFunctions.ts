import axios from "axios";
import { getLeagueTeamLogo } from "./LeaguePlayersData";

// URL-Segment fuer den Pokal-Reiter: /League/2026-27/Pokal
export const CUP_URL_SEGMENT = 'Pokal';

/////////////
// API     //
/////////////
// null = fuer diese Saison gibt es (noch) keinen Pokal.
export const getLeagueCup = async (seasonSlug: string) => {
    try {
        const response = await axios.get("/leagueCups/get/" + seasonSlug);
        return response.data.leagueCup as LeagueCup;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404)
            return null;
        throw error;
    }
}

export const createLeagueCup = async (seasonSlug: string, participants: LeagueCupParticipant[]) => {
    const response = await axios.post("/leagueCups/create", { season: seasonSlug, participants });
    return response.data.leagueCup as LeagueCup;
}

// Begegnungen werden manuell festgelegt, das Backend prueft nur die Vollstaendigkeit.
export const addLeagueCupRound = async (leagueCup: LeagueCup, pairings: LeagueCupPairing[], byes: string[]) => {
    const response = await axios.post("/leagueCups/round/" + leagueCup._id, { pairings, byes });
    return response.data.leagueCup as LeagueCup;
}

export const undoLeagueCupRound = async (leagueCup: LeagueCup) => {
    const response = await axios.delete("/leagueCups/round/" + leagueCup._id);
    return response.data.leagueCup as LeagueCup;
}

export const deleteLeagueCup = async (leagueCup: LeagueCup) => {
    const response = await axios.delete("/leagueCups/delete/" + leagueCup._id);
    return response.status == 200;
}

export const getCupErrorMessage = (error: unknown) =>
    axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message as string
        : 'Unbekannter Fehler';

////////////////////////
// RUNDEN             //
////////////////////////
// Gleiche Regeln wie im Backend (controllers/LeagueCup.ts).
// Freilose so, dass danach eine 2er-Potenz uebrig bleibt: 25 Teams -> 9 Spiele + 7 Freilose.
export const getByeCount = (teamCount: number) => {
    if (teamCount < 2) return 0;
    const powerOfTwo = 2 ** Math.floor(Math.log2(teamCount));
    if (powerOfTwo === teamCount) return 0;
    return 2 * powerOfTwo - teamCount;
}

export const getRoundName = (teamCount: number, roundIndex: number) => {
    if (teamCount === 2) return 'Finale';
    if (teamCount === 4) return 'Halbfinale';
    if (teamCount === 8) return 'Viertelfinale';
    return `${roundIndex + 1}. Runde`;
}

// Alle Runden des Pokals, auch die noch nicht festgelegten: 25 -> 1. Runde, 2. Runde, Viertelfinale, Halbfinale, Finale.
export const getPlannedRoundNames = (participantCount: number) => {
    const roundNames: string[] = [];
    let teamCount = participantCount;

    while (teamCount >= 2) {
        const byeCount = getByeCount(teamCount);
        roundNames.push(getRoundName(teamCount, roundNames.length));
        teamCount = byeCount + (teamCount - byeCount) / 2;
    }

    return roundNames;
}

////////////////////////
// ERGEBNISSE         //
////////////////////////
export const getCupGames = (leagueGames: Match[], leagueCup: LeagueCup) =>
    leagueGames.filter(match => match.cupId === leagueCup._id);

export const getCupRoundGames = (cupGames: Match[], roundIndex: number) =>
    cupGames.filter(match => match.cupRound === roundIndex);

const getTeamNames = (team: Team) =>
    [team.name, ...team.players.map(player => player.name)]
        .filter((name): name is string => !!name)
        .map(name => name.toLocaleLowerCase());

const getTeamScore = (team: Team) => team.players.reduce((acc, player) => acc + (player.score ?? 0), 0);

export const getPairingGames = (pairing: LeagueCupPairing, roundGames: Match[]) => {
    const team1Name = pairing.team1.toLocaleLowerCase();
    const team2Name = pairing.team2.toLocaleLowerCase();

    return roundGames
        .filter(match => {
            const names = [...getTeamNames(match.team1), ...getTeamNames(match.team2)];
            return names.includes(team1Name) && names.includes(team2Name);
        })
        .sort((match1, match2) => (match1.time ?? 0) - (match2.time ?? 0));
}

// Bei Best-of-1 entscheidet das erste Spiel, bei Best-of-3 wer zuerst 2 Siege hat.
export const getPairingResult = (pairing: LeagueCupPairing, roundGames: Match[], bestOf: number) => {
    const team1Name = pairing.team1.toLocaleLowerCase();
    const winsNeeded = Math.floor(bestOf / 2) + 1;
    const games = getPairingGames(pairing, roundGames);
    let team1Wins = 0;
    let team2Wins = 0;
    let winner: string | undefined;

    for (const match of games) {
        if (winner) break;

        const matchTeam1Score = getTeamScore(match.team1);
        const matchTeam2Score = getTeamScore(match.team2);
        if (matchTeam1Score === matchTeam2Score)
            continue;

        const matchTeam1IsPairingTeam1 = getTeamNames(match.team1).includes(team1Name);
        if (matchTeam1IsPairingTeam1 === (matchTeam1Score > matchTeam2Score))
            team1Wins++;
        else
            team2Wins++;

        if (team1Wins >= winsNeeded) winner = pairing.team1;
        if (team2Wins >= winsNeeded) winner = pairing.team2;
    }

    return { games, team1Wins, team2Wins, winner };
}

// Teams fuer die naechste Runde. complete = false, solange in der letzten Runde noch Sieger fehlen.
export const getRemainingTeams = (leagueCup: LeagueCup, cupGames: Match[]) => {
    const roundCount = leagueCup.rounds.length;
    if (roundCount === 0)
        return { teams: leagueCup.participants.map(participant => participant.teamName), complete: true };

    const lastRound = leagueCup.rounds[roundCount - 1];
    const roundGames = getCupRoundGames(cupGames, roundCount - 1);
    const winners = lastRound.pairings.map(pairing => getPairingResult(pairing, roundGames, lastRound.bestOf).winner);

    return {
        teams: [...winners.filter((winner): winner is string => !!winner), ...lastRound.byes],
        complete: winners.every(winner => !!winner),
    };
}

export const getCupWinner = (leagueCup: LeagueCup, cupGames: Match[]) => {
    const { teams, complete } = getRemainingTeams(leagueCup, cupGames);
    return leagueCup.rounds.length && complete && teams.length === 1 ? teams[0] : undefined;
}

// Mock-Team wie in LeagueFinalFour, Logo explizit (sonst gewinnt bei gleichnamigen Spielern das Profilbild).
// Ohne Score zeigt MatchElement "vs.".
export const toCupTeam = (teamName: string, seasonSlug?: string) => ({
    _id: '',
    logo: getLeagueTeamLogo(teamName, seasonSlug),
    players: [{ _id: '', name: teamName }],
}) as unknown as Team;

export const toCupPairingMatch = (pairing: LeagueCupPairing, seasonSlug?: string) => ({
    _id: '',
    team1: toCupTeam(pairing.team1, seasonSlug),
    team2: toCupTeam(pairing.team2, seasonSlug),
}) as Match;
