import { Match } from "@/types";

export const checkIfMatchFinished = (match:Match) => {
    if(match.team1 && match.team2)
        return match.team1.players[0].score != undefined;

    return false;
}

export const checkIfTeam1WonVsTeam2 = (match:Match) => {
    let team1Score = getMatchScore(match, true);
    let team2Score = getMatchScore(match, false);
    if(team1Score === undefined || team2Score === undefined)
        return undefined; // Match is not finished yet
    return team1Score > team2Score;
}

export const getMatchScore = (match:Match, isTeam1:boolean) => {
    if(!checkIfMatchFinished(match)) // If team is not set or the first player has no score, return undefined
        return undefined;
        
    let team = isTeam1 ? match.team1 : match.team2;
    return team.players.reduce((acc, player) => acc + (player.score || 0), 0);
}