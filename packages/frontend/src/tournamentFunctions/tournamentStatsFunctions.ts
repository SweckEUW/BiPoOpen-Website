import { getMatchesFromTeam } from "@/tournamentFunctions/tournamentTeamFunctions";
import { Tournament } from "@/types";
import { getFinishedMatchesFromPlayer } from "./tournamentPlayerFunctions";
import { checkIfTeam1WonVsTeam2 } from "./tournamentMatchFunctions";

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
    let matches = getFinishedMatchesFromPlayer(tournament,playerName,onlyGroupPhase);

    matches.forEach((match) => {
        [match.team1, match.team2].forEach((team) => {
            team.players.forEach((player) => {
                if(player.name == playerName)
                    score += player.score;
            });
        });
    });

    return score;
}

export const getAmmountOfMatchesFromPlayer = (tournament:Tournament|undefined, playerName:string, onlyGroupPhase:boolean) => { 
    let matches = getFinishedMatchesFromPlayer(tournament,playerName,onlyGroupPhase);
    return matches.length;
}

export const getAmmountOfWinsFromPlayer = (tournament:Tournament, playerName:string, onlyGroupPhase:boolean) => {
    let wins = 0;
    let matches = getFinishedMatchesFromPlayer(tournament,playerName,onlyGroupPhase);
    
    matches.forEach((match) => {
        [match.team1, match.team2].forEach((team) => {
            team.players.forEach((player) => {
                if(player.name == playerName && checkIfTeam1WonVsTeam2(match)) { // TODO; Ich glaube das ist nicht richtig 
                    wins ++;
                }
            });
        });
    });

    return wins;
}