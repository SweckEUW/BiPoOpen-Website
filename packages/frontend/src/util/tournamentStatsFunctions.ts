import { getFinishedMatchesFromTeam } from "@/util/tournamentTeamFunctions";
import { getFinishedMatchesFromPlayer } from "@/util/tournamentPlayerFunctions";
import { checkIfTeam1WonVsTeam2, getMatchScore } from "@/util/tournamentMatchFunctions";

////////////////
// TEAM STATS //
////////////////
export const getAmmountOfWinsFromTeam = (tournament:Tournament|undefined, teamName:string, onlyGroupPhase:boolean) => {
    let wins = 0;
    
    let matches = getFinishedMatchesFromTeam(tournament,teamName,onlyGroupPhase);

    matches.forEach((match) => {
        if(match.team1.name == teamName && checkIfTeam1WonVsTeam2(match))
            wins ++;
        if(match.team2.name == teamName && !checkIfTeam1WonVsTeam2(match))
            wins ++;
    });

    return wins;
}

export const getAmmountOfHitsFromTeam = (tournament:Tournament|undefined, teamName:string, onlyGroupPhase:boolean) => { 
    let score = 0;

    let matches = getFinishedMatchesFromTeam(tournament,teamName,onlyGroupPhase);

    matches.forEach((match) => {
        if(match.team1.name == teamName)
            score += getMatchScore(match, true)!;        
        if(match.team2.name == teamName)
            score += getMatchScore(match, false)!;        
    });

    return score;
}

export const getAmmountOfEnemyHitsFromTeam = (tournament:Tournament|undefined, teamName:string, onlyGroupPhase:boolean) => { 
    let score = 0;
    
    let matches = getFinishedMatchesFromTeam(tournament,teamName,onlyGroupPhase);

    matches.forEach((match) => {
        if(match.team1.name == teamName)
            score += getMatchScore(match, false)!;               
        if(match.team2.name == teamName)
            score += getMatchScore(match, true)!;       
    });

    return score;
}

export const getAmmountOfDrunkenCupsFromteam = (tournament:Tournament|undefined, teamName:string, onlyGroupPhase:boolean) => { 
    let leftOverCups = 0;
    let enemyHits = 0;

    let matches = getFinishedMatchesFromTeam(tournament,teamName,onlyGroupPhase);

    matches.forEach((match) => {
        // Getroffene Becher vom Gegner die Getrunken wurden
        if(match.team1.name == teamName)
            enemyHits += getMatchScore(match, false)!;
        if(match.team2.name == teamName)
            enemyHits += getMatchScore(match, true)!;

        // Stehengebliebene Becher vom Gegner bei Niederlage
        if(match.team1.name == teamName && !checkIfTeam1WonVsTeam2(match))
            leftOverCups += getMatchScore(match, false)! - getMatchScore(match, true)!;
        if(match.team2.name == teamName && checkIfTeam1WonVsTeam2(match))
            leftOverCups += getMatchScore(match, true)! - getMatchScore(match, false)!;
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