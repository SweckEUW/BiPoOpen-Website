const hasLegacyTeamResult = (match: Match) => {
    const result = (match as any).result;
    return typeof result?.team1Score === "number" && typeof result?.team2Score === "number";
}

export const checkIfMatchFinished = (match:Match) => {
    if(!match.team1 || !match.team2)
        return false;

    if(hasLegacyTeamResult(match))
        return true;

    const team1HasScore = match.team1.players.some((player) => player.score != undefined);
    const team2HasScore = match.team2.players.some((player) => player.score != undefined);
    return team1HasScore && team2HasScore;

}

export const checkIfTeam1WonVsTeam2 = (match:Match) => {
    let team1Score = getMatchScore(match, true);
    let team2Score = getMatchScore(match, false);
    if(team1Score === undefined || team2Score === undefined)
        return undefined; // Match is not finished yet
    return team1Score > team2Score;
}

export const getMatchScore = (match:Match, isTeam1:boolean) => {
    if(!match.team1 || !match.team2)
        return undefined;

    const legacyResult = (match as any).result;
    if(typeof legacyResult?.team1Score === "number" && typeof legacyResult?.team2Score === "number")
        return isTeam1 ? legacyResult.team1Score : legacyResult.team2Score;

    if(!checkIfMatchFinished(match)) // If team is not set or scores are missing, return undefined
        return undefined;
        
    let team = isTeam1 ? match.team1 : match.team2;
    return team.players.reduce((acc, player) => acc + (player.score ?? 0), 0);
}