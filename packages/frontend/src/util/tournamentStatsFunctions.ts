import { getMatchesGroupPhase, getMatchesKOPhase } from "@/util/tournamentUtilFunctions.js";

export const getAmmountOfWinsFromTeam = (tournament:any, teamName:string, onlyGroupPhase:boolean) => {
    let wins = 0;
    
    let matches = getMatchesGroupPhase(tournament)
    if(!onlyGroupPhase)
        matches = matches.concat(getMatchesKOPhase(tournament));
    
    matches.forEach((group:any) => {
        group.forEach((match:any) => {
            if(match.result){
                if(match.team1.name == teamName && match.result.team1Score > match.result.team2Score){
                    wins ++;
                }
                if(match.team2.name == teamName && match.result.team2Score > match.result.team1Score){
                    wins ++;
                }
            }
        });
    });

    return wins;
}

export const getAmmountOfHitsFromTeam = (tournament:any, teamID:any, onlyGroupPhase:boolean) => { 
    let score:number = 0;

    let matches = getMatchesGroupPhase(tournament)
    if(!onlyGroupPhase)
        matches = matches.concat(getMatchesKOPhase(tournament));

    matches.forEach((groups:any) => {
        groups.forEach((match:any) => {
            if(match.result){
                if(match.team1._id == teamID)
                    score += match.result.team1Score;        
                if(match.team2._id == teamID)
                    score += match.result.team2Score;        
            }
        });
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

export const getAmmountOfEnemyHitsFromTeam = (tournament:any, teamID:string, onlyGroupPhase:boolean) => { 
    let score:number = 0;
    
    let matches = getMatchesGroupPhase(tournament);
    if(!onlyGroupPhase)
        matches = matches.concat(getMatchesKOPhase(tournament));

    matches.forEach((groups:any) => {
        groups.forEach((match:any) => {
            if(match.result){
                if(match.team1._id == teamID)
                    score += match.result.team2Score;               
                if(match.team2._id == teamID)
                    score += match.result.team1Score          
            }
        });
    });

    return score;
}

export const getAmmountEnemyHitsFromPlayer = (tournament:any, playerName:any, onlyGroupPhase:boolean) => { 
    let score:number = 0;
    
    let matches = getMatchesGroupPhase(tournament);
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

export const getAmmountOfMatchesFromPlayer = (tournament:any, playerName:string, onlyGroupPhase:boolean) => { 
    let ammountOfMatches = 0;

    let matches = getMatchesGroupPhase(tournament);
    if(!onlyGroupPhase)
        matches = matches.concat(getMatchesKOPhase(tournament));

    matches.forEach((groups:any) => {
        groups.forEach((match:any) => {
            if(match.result){
                if(
                    match.team1.players[0] == playerName || match.team1.players[1] == playerName ||
                    match.team2.players[0] == playerName || match.team2.players[1] == playerName
                )
                    ammountOfMatches ++;                 
            }
        });
    });

    return ammountOfMatches;
}

export const checkIfTeam1WonVsTeam2 = (tournament:any, team1ID:string, team2ID:string) => { 
    let team1Won = false;

    let matches = getMatchesGroupPhase(tournament);
    matches.forEach((matchesForGroup:any) => {
        matchesForGroup.forEach((match:any) => {
            if(match.result){
                if(match.team1._id == team1ID && match.team2._id == team2ID)
                    team1Won = match.result.team1Score > match.result.Team2ID;   
            }
        });
    });

    return team1Won;
}

export const getAmmountOfDrunkenCupsFromteam = (tournament:any, team:any, onlyGroupPhase:boolean) => { 
    let matches = getMatchesGroupPhase(tournament);
    if(!onlyGroupPhase)
        matches = matches.concat(getMatchesKOPhase(tournament));

    let leftOverCups = 0;
    let enemyHits = 0;
    matches.forEach((groups:any) => {
        groups.forEach((match:any) => {
            if(match.result){
                // Getroffene Becher vom Gegner die Getrunken wurden
                if(match.team1._id == team._id)
                    enemyHits += match.result.team2Score;               
                if(match.team2._id == team._id)
                    enemyHits += match.result.team1Score;           

                // Stehengebliebene Becher vom Gegner bei Niederlage
                if(match.team1._id == team._id && match.result.team1Score < match.result.team2Score)
                    leftOverCups += match.result.team2Score - match.result.team1Score;
                if(match.team2._id == team._id && match.result.team1Score > match.result.team2Score)
                    leftOverCups += match.result.team1Score - match.result.team2Score;
            }
        });
    });

    return (leftOverCups + enemyHits);
}