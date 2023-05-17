export const getAmmountOfWinsFromTeam = (tournament:any, teamName:any) => {
    let wins:number = 0;
    let matches = tournament.groupPhase.matches;
    matches.forEach((group:any) => {
        group.forEach((match:any) => {
            if(match.result){
                if(match.team1.name == teamName)
                    if(match.result.team1Score > match.result.team2Score)
                        wins += 1;
                
                if(match.team2.name == teamName)
                    if(match.result.team2Score > match.result.team1Score)
                        wins += 1;
            }
        });
    });

    return wins;
}

export const getAmmountOfHitsFromTeam = (tournament:any, team:any) => { 
    let score = 0;
    team.players.forEach((player:any) => {
        score += getAmmoungHitsFromPlayer(tournament, player);
    });
    return score;
}

export const getAmmoungHitsFromPlayer = (tournament:any, playerName:any) => { 
    let score = 0;
    let matches = tournament.groupPhase.matches;
    matches.forEach((groups:any) => {
        groups.forEach((match:any) => {
            if(match.result){
                if(match.team1.players[0] == playerName)
                    score += match.result.team1Player1Score;
                               
                if(match.team1.players[1] == playerName)
                    score += match.result.team1Player2Score;

                if(match.team2.players[0] == playerName)
                    score += match.result.team2Player1Score
                
                if(match.team2.players[1] == playerName)
                    score += match.result.team2Player2Score;
            }
        });
    });

    return score;
}

export const getAmmountOfEnemyHitsFromTeam = (tournament:any, team:any) => { 
    let score = 0;
    team.players.forEach((player:any) => {
        score += getAmmountEnemyHitsFromPlayer(tournament, player);
    });
    return score;
}

export const getAmmountEnemyHitsFromPlayer = (tournament:any, playerName:any) => { 
    let score = 0;
    let matches = tournament.groupPhase.matches;
    matches.forEach((groups:any) => {
        groups.forEach((match:any) => {
            if(match.result){
                if(match.team1.players[0] == playerName)
                    score += match.result.team2Player1Score;
                               
                if(match.team1.players[1] == playerName)
                    score += match.result.team2Player2Score;

                if(match.team2.players[0] == playerName)
                    score += match.result.team1Player1Score
                
                if(match.team2.players[1] == playerName)
                    score += match.result.team1Player2Score;
            }
        });
    });

    return score;
}

export const getHitDifferenceFromTeam = (tournament:any, team:any) => { 
   return getAmmountOfHitsFromTeam(tournament, team) - getAmmountOfEnemyHitsFromTeam(tournament, team);
}

export const getAmmountOfMatchesFromPlayer = (tournament:any, playerName:any) => { 
    let ammountOfMatches = 0;
    let matches = tournament.groupPhase.matches;
    matches.forEach((groups:any) => {
        groups.forEach((match:any) => {
            if(match.result){
                if(match.team1.players[0] == playerName)
                    ammountOfMatches ++;
                               
                if(match.team1.players[1] == playerName)
                    ammountOfMatches ++;

                if(match.team2.players[0] == playerName)
                    ammountOfMatches ++;
                
                if(match.team2.players[1] == playerName)
                    ammountOfMatches ++;
            }
        });
    });

    return ammountOfMatches;
}