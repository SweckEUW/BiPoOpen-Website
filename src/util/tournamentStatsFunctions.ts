import { getMatchesGroupPhase, getMatchesKOPhase } from "@/util/tournamentUtilFunctions.js";

export const getAmmountOfWinsFromTeam = (tournament:any, teamName:any, onlyGroupPhase:boolean) => {
    let wins:number = 0;
    
    let matches = getMatchesGroupPhase(tournament)
    if(!onlyGroupPhase)
        matches = matches.concat(getMatchesKOPhase(tournament));

    matches.forEach((group:any) => {
        group.forEach((match:any) => {
            if(match.result){
                if(match.team1.name == teamName && match.result.team1Score > match.result.team2Score)
                    wins += 1;
                if(match.team2.name == teamName && match.result.team2Score > match.result.team1Score)
                    wins += 1;
            }
        });
    });

    return wins;
}

export const getAmmountOfHitsFromTeam = (tournament:any, team:any, onlyGroupPhase:boolean) => { 
    let score:number = 0;
    team.players.forEach((player:any) => {
        score += getAmmountOfHitsFromPlayer(tournament, player, onlyGroupPhase);
    });
    return score;
}

export const getAmmountOfHitsFromPlayer = (tournament:any, playerName:any, onlyGroupPhase:boolean) => { 
    let score:number = 0;

    let matches = getMatchesGroupPhase(tournament)
    if(!onlyGroupPhase)
        matches = matches.concat(getMatchesKOPhase(tournament));

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

export const getAmmountOfEnemyHitsFromTeam = (tournament:any, team:any, onlyGroupPhase:boolean) => { 
    let score:number = 0;
    team.players.forEach((player:any) => {
        score += getAmmountEnemyHitsFromPlayer(tournament, player, onlyGroupPhase);
    });
    return score;
}

export const getAmmountEnemyHitsFromPlayer = (tournament:any, playerName:any,  onlyGroupPhase:boolean) => { 
    let score:number = 0;
    
    let matches = getMatchesGroupPhase(tournament)
    if(!onlyGroupPhase)
        matches = matches.concat(getMatchesKOPhase(tournament));

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

export const getHitDifferenceFromTeam = (tournament:any, team:any, onlyGroupPhase:boolean) => { 
   return getAmmountOfHitsFromTeam(tournament, team, onlyGroupPhase) - getAmmountOfEnemyHitsFromTeam(tournament, team, onlyGroupPhase);
}

export const getAmmountOfMatchesFromPlayer = (tournament:any, playerName:any, onlyGroupPhase:boolean) => { 
    let ammountOfMatches:number = 0;

    let matches = getMatchesGroupPhase(tournament)
    if(!onlyGroupPhase)
        matches = matches.concat(getMatchesKOPhase(tournament));

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