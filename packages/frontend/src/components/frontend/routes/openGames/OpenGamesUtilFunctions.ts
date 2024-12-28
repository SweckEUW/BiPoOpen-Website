import axios from "axios";
import { OpenGame } from "./OpenGamesTypes";

/////////////
// GENERAL //
/////////////
export const getAllOpenGames = async () => {
    let response = await axios.get("/openGames")
    console.log(response.data.message);
    if(response.data.success)
        return response.data.openGames as OpenGame[];
}

export const addOpenGame = async (openGame:OpenGame) => {
    let response = await axios.post("/addOpenGame", openGame);
    console.log(response.data.message);
    return response.data.success as boolean;
}



////////////////
// STATISTICS //
////////////////
export const getAllTimeOpenGamesStatsList = (openGames:OpenGame[]) => {
    let playersWithStats = getPlayersWithStats(openGames);

    // Sort after average wins, then after average score
    playersWithStats.sort((player1, player2) => {
        if(player2.averageWins == player1.averageWins)
            return player2.averageScore - player1.averageScore;
        else if(player2.averageScore == player1.averageScore)
            return player2.wins - player1.wins;
        
        return player2.averageWins - player1.averageWins;
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

export const getPlayersWithStats = (openGames:OpenGame[]) => {
    let playerWithStats:PlayerWithStats[] = [];

    let allPlayers = getAllPlayers(openGames);

    allPlayers.forEach((playerName) => {
        let ammountOfMatches = getMatchesFromPlayer(openGames, playerName).length;
        let score = getAmmountOfHitsFromPlayer(openGames, playerName);
        let wins = getAmmountOfWinsFromPlayer(openGames, playerName);

        let player = {
            name: playerName,
            score: score,
            ammountOfMatches: ammountOfMatches,
            ammountOfDrunkenCups: getAmmountOfDrunkenCupsFromPlayer(openGames, playerName),
            wins: wins,
            averageScore: Math.round((ammountOfMatches == 0 ? 0 : score / ammountOfMatches) * 100) / 100, // TODO: if average is 7 show 7.00
            averageWins: Math.round((ammountOfMatches == 0 ? 0 : wins / ammountOfMatches) * 100),
        };

        playerWithStats.push(player); 
    });
    
    return playerWithStats;
}

export const getAllPlayers = (openGames:OpenGame[]) => {
    let allPlayerNames:string[] = [];


    // Add all players to array
    openGames.forEach(openGame => {
        allPlayerNames.push(...openGame.team1.players.map(player => player.name));
        allPlayerNames.push(...openGame.team2.players.map(player => player.name));
    });

    // Remove doublicate player names
    allPlayerNames = allPlayerNames.filter((playerName, index) => allPlayerNames.indexOf(playerName) == index);
    
    
    return allPlayerNames;
}

export const getMatchesFromPlayer = (openGames:OpenGame[], playerName:string) => { 
    let matchesFromPlayer:OpenGame[] = [];

    openGames.forEach((openGame) => {
        if(openGame.team1.players.map(player => player.name).includes(playerName) || openGame.team2.players.map(player => player.name).includes(playerName))
            matchesFromPlayer.push(openGame);       
    });

    return matchesFromPlayer;
}

export const getAmmountOfWinsFromPlayer = (openGames:OpenGame[], playerName:string) => {
    let wins = 0;
    
    let matches = getMatchesFromPlayer(openGames, playerName);
    
    matches.forEach((match) => {
        if((match.team1.players.map(player => player.name).includes(playerName))){
            let team1Score = match.team1.players.reduce((acc, player) => acc + player.score, 0);
            let team2Score = match.team2.players.reduce((acc, player) => acc + player.score, 0);
            if(team1Score > team2Score)
                wins ++;
        }

        if((match.team2.players.map(player => player.name).includes(playerName))){
            let team1Score = match.team1.players.reduce((acc, player) => acc + player.score, 0);
            let team2Score = match.team2.players.reduce((acc, player) => acc + player.score, 0);
            if(team2Score > team1Score)
                wins ++;
        }
    });

    return wins;
}

export const getAmmountOfHitsFromPlayer = (openGames:OpenGame[], playerName:string) => {
    let score = 0;

    let matches = getMatchesFromPlayer(openGames, playerName);

    matches.forEach((match) => {
        if(match.team1.players.map(player => player.name).includes(playerName))
            score += match.team1.players.find(player => player.name == playerName)!.score;
        if(match.team2.players.map(player => player.name).includes(playerName))
            score += match.team2.players.find(player => player.name == playerName)!.score;
    });

    return score;
}

export const getAmmountOfDrunkenCupsFromPlayer = (openGames:OpenGame[], playerName:string) => {
    // let leftOverCups = 0;
    // let enemyHits = 0;

    // let matches = getMatchesFromPlayer(openGames, playerName);

    // matches.forEach((match) => {
    //     // Getroffene Becher vom Gegner die Getrunken wurden
    //     if(match.team1.name == teamName)
    //         enemyHits += match.result.team2Score;               
    //     if(match.team2.name == teamName)
    //         enemyHits += match.result.team1Score;           

    //     // Stehengebliebene Becher vom Gegner bei Niederlage
    //     if(match.team1.name == teamName && match.result.team1Score < match.result.team2Score)
    //         leftOverCups += match.result.team2Score - match.result.team1Score;
    //     if(match.team2.name == teamName && match.result.team1Score > match.result.team2Score)
    //         leftOverCups += match.result.team1Score - match.result.team2Score;
    // });

    // return (leftOverCups + enemyHits);

    return 1;
}
