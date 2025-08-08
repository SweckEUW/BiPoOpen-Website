import { getAllTeams } from "@/util/tournamentTeamFunctions";
import { getAmmountOfDrunkenCupsFromteam, getAmmountOfHitsFromPlayer, getAmmountOfMatchesFromPlayer, getAmmountOfWinsFromPlayer } from "@/util/tournamentStatsFunctions";
import { checkIfMatchFinished } from "@/util/tournamentMatchFunctions";

export const getPlayersWithStats = (tournament:Tournament|undefined) => {
    if(!tournament)
        return [];     

    let players:PlayerWithStats[] = [];
    let teams = getAllTeams(tournament);
    
    for (let i = 0; i < teams.length; i++) {
        for (let x = 0; x < teams[i].players.length; x++) {
            let ammountOfMatches = getAmmountOfMatchesFromPlayer(tournament, teams[i].players[x].name, false);
            let score = getAmmountOfHitsFromPlayer(tournament, teams[i].players[x].name, false);
            let wins = getAmmountOfWinsFromPlayer(tournament, teams[i].players[x].name, false);
            
            let player = {
                name: teams[i].players[x].name,
                score: score,
                ammountOfMatches: ammountOfMatches,
                ammountOfMatchesWithTrackedShots: tournament.settings.trackPlayerShots ? ammountOfMatches : 0,
                ammountOfDrunkenCups: Math.ceil(getAmmountOfDrunkenCupsFromteam(tournament, teams[i].name!, false) / 2),
                wins: wins,
                averageScore: Math.round((ammountOfMatches == 0 ? 0 : score / ammountOfMatches) * 100) / 100, // TODO: if average is 7 show 7.00
                averageWins: Math.round((ammountOfMatches == 0 ? 0 : wins / ammountOfMatches) * 100) / 100,
            };

            players.push(player); 
        }
    }

    return players;
}

export const getMVPList = (tournament:Tournament) => {
    let playersWithStats = getPlayersWithStats(tournament);

    // Sort after average hit cups per game
    playersWithStats.sort((player1, player2) => {
        if(player2.averageScore == player1.averageScore)
            return player2.ammountOfDrunkenCups - player1.ammountOfDrunkenCups;

        return player2.averageScore - player1.averageScore;
    });

    // Set placement
    for (let i = 0; i < playersWithStats.length; i++) {
        playersWithStats[i].placement = i;
        let playersWithSameScore = playersWithStats.filter((player) => player.averageScore == playersWithStats[i].averageScore && player.ammountOfDrunkenCups == playersWithStats[i].ammountOfDrunkenCups)
        if(playersWithSameScore.length > 1){
            playersWithSameScore.forEach((playerWithSameScore) => {
                playerWithSameScore.placement = playersWithSameScore[0].placement;
            });
        }
    }

    return playersWithStats;
}

export const getFinishedMatchesFromPlayer = (tournament:Tournament|undefined, playerName:string, onlyGroupPhase:boolean) => { 
    if(!tournament)
        return [];

    let matchesFromPlayer:Match[] = [];

    let matches = tournament.groupPhase.matches;
    if(!onlyGroupPhase)
        matches = matches.concat(tournament.koPhase.matches);

    matches.forEach((groups) => {
        groups.forEach((match) => {
            if(checkIfMatchFinished(match)){
                if(
                    match.team1.players[0].name == playerName || match.team1.players[1].name == playerName ||
                    match.team2.players[0].name == playerName || match.team2.players[1].name == playerName
                ){
                    matchesFromPlayer.push(match);       
                }
            }
        });
    });

    return matchesFromPlayer;
}