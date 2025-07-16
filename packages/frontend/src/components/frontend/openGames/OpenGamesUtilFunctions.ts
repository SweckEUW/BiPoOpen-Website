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
export const getAllTimeOpenGamesStatsList = (openGames:OpenGame[], oneVersusOne:boolean) => {
    let playersWithStats = getPlayersWithStats(openGames, oneVersusOne);

    // Filter out players that dont have at least 3 Games
    playersWithStats = playersWithStats.filter((player) => player.ammountOfMatches >= 3);

    // Filter out players that havent played played against at least 4 different teams
    playersWithStats = playersWithStats.filter((player) => {
        let matches = getMatchesFromPlayer(openGames, player.name, oneVersusOne);
        let teams = new Set<string>();
        matches.forEach((match) => {
            if(oneVersusOne){
                if(match.team1.players[0].name == player.name)
                    teams.add(match.team2.players[0].name);
                else
                    teams.add(match.team1.players[0].name);
            }else{
                if(match.team1.players.map(player => player.name).includes(player.name))
                    teams.add(match.team2.players.map(player => player.name).join(","));
                else
                    teams.add(match.team1.players.map(player => player.name).join(","));
            }
        });

        if(player.name == "David Jones")
            console.log(teams);

        return teams.size >= 4;
    });

    // Sort after average wins, then after average score
    playersWithStats.sort((player1, player2) => {
        if(player2.averageWins == player1.averageWins && player2.wins == player1.wins)
            return player2.averageScore - player1.averageScore;
        else if(player2.averageWins == player1.averageWins)
            return player2.wins - player1.wins;
        
        return player2.averageWins - player1.averageWins;
    });

    // Set placement
    for (let i = 0; i < playersWithStats.length; i++){
        playersWithStats[i].placement = i;
        let playersWithSameScore = playersWithStats.filter((player) => player.averageWins == playersWithStats[i].averageWins && player.averageScore == playersWithStats[i].averageScore && player.wins == playersWithStats[i].wins);
        if(playersWithSameScore.length > 1){
            playersWithSameScore.forEach((playerWithSameScore) => {
                playerWithSameScore.placement = playersWithSameScore[0].placement;
            });
        }
    }

    return playersWithStats;
}

export const getPlayersWithStats = (openGames:OpenGame[], oneVersusOne:boolean) => {
    let playerWithStats:PlayerWithStats[] = [];

    let allPlayers = getAllPlayers(openGames, oneVersusOne);

    allPlayers.forEach((playerName) => {
        let ammountOfMatches = getMatchesFromPlayer(openGames, playerName, oneVersusOne).length;
        let score = getAmmountOfHitsFromPlayer(openGames, playerName, oneVersusOne);
        let wins = getAmmountOfWinsFromPlayer(openGames, playerName, oneVersusOne);

        let player = {
            name: playerName,
            score: score,
            ammountOfMatches: ammountOfMatches,
            ammountOfMatchesWithTrackedShots: ammountOfMatches,
            ammountOfDrunkenCups: getAmmountOfDrunkenCupsFromPlayer(openGames, playerName),
            wins: wins,
            averageScore: Math.round((ammountOfMatches == 0 ? 0 : score / ammountOfMatches) * 100) / 100, // TODO: if average is 7 show 7.00
            averageWins: Math.round((ammountOfMatches == 0 ? 0 : wins / ammountOfMatches) * 100),
        };

        playerWithStats.push(player); 
    });
    
    return playerWithStats;
}

export const getAllPlayers = (openGames:OpenGame[], oneVersusOne:boolean) => {
    let allPlayerNames:string[] = [];

    // Add all players to array
    openGames.forEach(openGame => {
        if(oneVersusOne){
            if(openGame.team1.players.length == 1 && openGame.team2.players.length == 1){
                allPlayerNames.push(...openGame.team1.players.map(player => player.name));
                allPlayerNames.push(...openGame.team2.players.map(player => player.name));
            }
        }else{
            if(openGame.team1.players.length == 2 && openGame.team2.players.length == 2){
                allPlayerNames.push(...openGame.team1.players.map(player => player.name));
                allPlayerNames.push(...openGame.team2.players.map(player => player.name));
            }
        }
    });

    // Remove doublicate player names
    allPlayerNames = allPlayerNames.filter((playerName, index) => allPlayerNames.indexOf(playerName) == index);
    
    return allPlayerNames;
}

export const getMatchesFromPlayer = (openGames:OpenGame[], playerName:string, oneVersusOne:boolean) => { 
    let matchesFromPlayer:OpenGame[] = [];

    openGames.forEach((openGame) => {
        if(openGame.team1.players.map(player => player.name).includes(playerName) || openGame.team2.players.map(player => player.name).includes(playerName)){
            if(oneVersusOne){
                if(openGame.team1.players.length == 1 || openGame.team2.players.length == 1){
                    matchesFromPlayer.push(openGame);
                }
            }else{
                if(openGame.team1.players.length == 2 || openGame.team2.players.length == 2){
                    matchesFromPlayer.push(openGame);
                }
            }
        }
    });

    return matchesFromPlayer;
}

export const getAmmountOfWinsFromPlayer = (openGames:OpenGame[], playerName:string, oneVersusOne:boolean) => {
    let wins = 0;
    
    let matches = getMatchesFromPlayer(openGames, playerName, oneVersusOne);
    
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

export const getAmmountOfHitsFromPlayer = (openGames:OpenGame[], playerName:string, oneVersusOne:boolean) => {
    let score = 0;

    let matches = getMatchesFromPlayer(openGames, playerName, oneVersusOne);

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
