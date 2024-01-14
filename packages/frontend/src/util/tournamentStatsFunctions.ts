import { getMatchesFromPlayer, getMatchesFromTeam, getMatchesGroupPhase, getMatchesKOPhase } from "@/util/tournamentUtilFunctions.js";


////////////////
// TEAM STATS //
////////////////
export const getAmmountOfWinsFromTeam = (tournament:any, teamName:string, onlyGroupPhase:boolean) => {
    let wins = 0;
    
    let matches = getMatchesFromTeam(tournament,teamName,onlyGroupPhase);

    matches.forEach((match:any) => {
        if(match.team1.name == teamName && match.result.team1Score > match.result.team2Score){
            wins ++;
        }
        if(match.team2.name == teamName && match.result.team2Score > match.result.team1Score){
            wins ++;
        }
    });

    return wins;
}

export const getAmmountOfHitsFromTeam = (tournament:any, teamName:string, onlyGroupPhase:boolean) => { 
    let score = 0;

    let matches = getMatchesFromTeam(tournament,teamName,onlyGroupPhase);
    matches.forEach((match:any) => {
        if(match.team1.name == teamName)
            score += match.result.team1Score;        
        if(match.team2.name == teamName)
            score += match.result.team2Score;        
    });

    return score;
}

export const getAmmountOfEnemyHitsFromTeam = (tournament:any, teamName:string, onlyGroupPhase:boolean) => { 
    let score:number = 0;
    
    let matches = getMatchesFromTeam(tournament,teamName,onlyGroupPhase);

    matches.forEach((match:any) => {
        if(match.team1.name == teamName)
            score += match.result.team2Score;               
        if(match.team2.name == teamName)
            score += match.result.team1Score          
    });

    return score;
}

export const getAmmountOfDrunkenCupsFromteam = (tournament:any, teamName:string, onlyGroupPhase:boolean) => { 
    let leftOverCups = 0;
    let enemyHits = 0;

    let matches = getMatchesFromTeam(tournament,teamName,onlyGroupPhase);

    matches.forEach((match:any) => {
        // Getroffene Becher vom Gegner die Getrunken wurden
        if(match.team1.name == teamName)
            enemyHits += match.result.team2Score;               
        if(match.team2.name == teamName)
            enemyHits += match.result.team1Score;           

        // Stehengebliebene Becher vom Gegner bei Niederlage
        if(match.team1.name == teamName && match.result.team1Score < match.result.team2Score)
            leftOverCups += match.result.team2Score - match.result.team1Score;
        if(match.team2.name == teamName && match.result.team1Score > match.result.team2Score)
            leftOverCups += match.result.team1Score - match.result.team2Score;
    });

    return (leftOverCups + enemyHits);
}

//////////////////
// PLAYER STATS //
//////////////////
export const getAmmountOfHitsFromPlayer = (tournament:any, playerName:string, onlyGroupPhase:boolean) => { 
    let score = 0;

    let matches = getMatchesFromPlayer(tournament,playerName,onlyGroupPhase);

    matches.forEach((match:any) => {
        if(match.team1.players[0] == playerName)
            score += match.result.team1Player1Score;        
        if(match.team1.players[1] == playerName)
            score += match.result.team1Player2Score;
        if(match.team2.players[0] == playerName)
            score += match.result.team2Player1Score
        if(match.team2.players[1] == playerName)
            score += match.result.team2Player2Score;
    });

    return score;
}

export const getAmmountEnemyHitsFromPlayer = (tournament:any, playerName:string, onlyGroupPhase:boolean) => { 
    let score = 0;
    
    let matches = getMatchesFromPlayer(tournament,playerName,onlyGroupPhase);

    matches.forEach((match:any) => {
        if(match.team1.players[0] == playerName)
            score += match.result.team2Player1Score;               
        if(match.team1.players[1] == playerName)
            score += match.result.team2Player2Score;
        if(match.team2.players[0] == playerName)
            score += match.result.team1Player1Score          
        if(match.team2.players[1] == playerName)
            score += match.result.team1Player2Score;
    });

    return score;
}

export const getAmmountOfMatchesFromPlayer = (tournament:any, playerName:string, onlyGroupPhase:boolean) => { 
    let matches = getMatchesFromPlayer(tournament,playerName,onlyGroupPhase);
    return matches.length;
}

export const getAmmountOfWinsFromPlayer = (tournament:any, playerName:string, onlyGroupPhase:boolean) => {
    let wins = 0;
    
    let matches = getMatchesFromPlayer(tournament,playerName,onlyGroupPhase);
    
    matches.forEach((match:any) => {
        if((match.team1.players[0] == playerName || match.team1.players[1] == playerName) && match.result.team1Score > match.result.team2Score)
            wins ++;
        
        if((match.team2.players[0] == playerName || match.team2.players[1] == playerName) && match.result.team2Score > match.result.team1Score)
            wins ++;
    });

    return wins;
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