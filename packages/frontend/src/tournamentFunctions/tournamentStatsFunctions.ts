import { getMatchesFromTeam } from "@/tournamentFunctions/tournamentTeamFunctions";
import { Tournament } from "@/types";
import { getMatchesFromPlayer } from "./tournamentPlayerFunctions";

////////////////
// TEAM STATS //
////////////////
export const getAmmountOfWinsFromTeam = (tournament:Tournament|undefined, teamName:string, onlyGroupPhase:boolean) => {
    let wins = 0;
    
    let matches = getMatchesFromTeam(tournament,teamName,onlyGroupPhase);

    matches.forEach((match) => {
        if(match.team1.name == teamName && match.result.team1Score > match.result.team2Score)
            wins ++;
        if(match.team2.name == teamName && match.result.team2Score > match.result.team1Score)
            wins ++;
    });

    return wins;
}

export const getAmmountOfHitsFromTeam = (tournament:Tournament|undefined, teamName:string, onlyGroupPhase:boolean) => { 
    let score = 0;

    let matches = getMatchesFromTeam(tournament,teamName,onlyGroupPhase);
    matches.forEach((match) => {
        if(match.team1.name == teamName)
            score += match.result.team1Score;        
        if(match.team2.name == teamName)
            score += match.result.team2Score;        
    });

    return score;
}

export const getAmmountOfEnemyHitsFromTeam = (tournament:Tournament|undefined, teamName:string, onlyGroupPhase:boolean) => { 
    let score = 0;
    
    let matches = getMatchesFromTeam(tournament,teamName,onlyGroupPhase);

    matches.forEach((match) => {
        if(match.team1.name == teamName)
            score += match.result.team2Score;               
        if(match.team2.name == teamName)
            score += match.result.team1Score       
    });

    return score;
}

export const getAmmountOfDrunkenCupsFromteam = (tournament:Tournament|undefined, teamName:string, onlyGroupPhase:boolean) => { 
    let leftOverCups = 0;
    let enemyHits = 0;

    let matches = getMatchesFromTeam(tournament,teamName,onlyGroupPhase);

    matches.forEach((match) => {
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
export const getAmmountOfHitsFromPlayer = (tournament:Tournament, playerName:string, onlyGroupPhase:boolean) => { 
    if(!tournament.settings.trackPlayerShots)
        return 0;
    
    let score = 0;

    let matches = getMatchesFromPlayer(tournament,playerName,onlyGroupPhase);

    matches.forEach((match) => {
        if(match.team1.players[0] == playerName)
            score += match.result.team1Player1Score!;        
        if(match.team1.players[1] == playerName)
            score += match.result.team1Player2Score!;
        if(match.team2.players[0] == playerName)
            score += match.result.team2Player1Score!;
        if(match.team2.players[1] == playerName)
            score += match.result.team2Player2Score!;
    });

    return score;
}

export const getAmmountEnemyHitsFromPlayer = (tournament:Tournament, playerName:string, onlyGroupPhase:boolean) => { 
    if(!tournament.settings.trackPlayerShots)
        return 0;

    let score = 0;
    
    let matches = getMatchesFromPlayer(tournament,playerName,onlyGroupPhase);

    matches.forEach((match) => {
        if(match.team1.players[0] == playerName)
            score += match.result.team2Player1Score!;               
        if(match.team1.players[1] == playerName)
            score += match.result.team2Player2Score!;
        if(match.team2.players[0] == playerName)
            score += match.result.team1Player1Score!;       
        if(match.team2.players[1] == playerName)
            score += match.result.team1Player2Score!;
    });

    return score;
}

export const getAmmountOfMatchesFromPlayer = (tournament:Tournament|undefined, playerName:string, onlyGroupPhase:boolean) => { 
    let matches = getMatchesFromPlayer(tournament,playerName,onlyGroupPhase);
    return matches.length;
}

export const getAmmountOfWinsFromPlayer = (tournament:Tournament, playerName:string, onlyGroupPhase:boolean) => {
    let wins = 0;
    
    let matches = getMatchesFromPlayer(tournament,playerName,onlyGroupPhase);
    
    matches.forEach((match) => {
        if((match.team1.players[0] == playerName || match.team1.players[1] == playerName) && match.result.team1Score > match.result.team2Score)
            wins ++;
        
        if((match.team2.players[0] == playerName || match.team2.players[1] == playerName) && match.result.team2Score > match.result.team1Score)
            wins ++;
    });

    return wins;
}

export const checkIfTeam1WonVsTeam2 = (tournament:Tournament|undefined, team1Name:string, team2Name:string) => { 
    let team1Won = false;

    let matches = tournament?.groupPhase.matches ?? [];

    matches.forEach((matchesForGroup) => {
        matchesForGroup.forEach((match) => {
            if(match.result && match.team1.name == team1Name && match.team2.name == team2Name)
                team1Won = match.result.team1Score > match.result.team2Score;   
        });
    });

    return team1Won;
}