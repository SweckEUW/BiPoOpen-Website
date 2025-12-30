import axios from "axios";

/////////////
// GENERAL //
/////////////
export const getAllOpenGames = async () => {
    let response = await axios.get("/openGames/get");
    if(response.status == 200)
        return response.data.openGames as Match[];

    return [];
}

export const addOpenGame = async (openGame:Match) => {
    let response = await axios.post("/openGames/create", openGame);
    return response.status == 201
}

export const updateOpenGame = async (openGame:Match) => {
    let response = await axios.patch("/openGames/update/" + openGame._id, openGame);
    return response.status == 200;
}

export const getAllOpenGameNames = async () => {
    let allOpenGames = await getAllOpenGames();

    let openGameNames = [
        ...new Set(
            allOpenGames.flatMap(game =>
                [...game.team1.players, ...game.team2.players].map(
                    p => p.name
                        .split(" ")
                        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                        .join(" ")
                )
            )
        )
    ];

    return openGameNames;
}


////////////////
// STATISTICS //
////////////////
export const getAllTimeOpenGamesStatsList = (openGames:Match[], oneVersusOne:boolean) => {
    let playersWithStats = getPlayersWithStats(openGames, oneVersusOne);

    // Filter out players that dont have at least 3 Games
    playersWithStats = playersWithStats.filter((player) => player.ammountOfMatches >= 3);

    // Filter out players that havent played played against at least 4 different teams
    playersWithStats = playersWithStats.filter((player) => {
        let matches = getMatchesFromPlayer(openGames, player.name, oneVersusOne);
        let teams = new Set<string>();
        matches.forEach((match) => {
            if(oneVersusOne){
                if(match.team1!.players[0].name.toLowerCase() == player.name)
                    teams.add(match.team2!.players[0].name);
                else
                    teams.add(match.team1!.players[0].name);
            }else{
                if(match.team1!.players.map(player => player.name.toLowerCase()).includes(player.name))
                    teams.add(match.team2!.players.map(player => player.name).join(","));
                else
                    teams.add(match.team1!.players.map(player => player.name).join(","));
            }
        });

        return teams.size >= 4;
    });

    // Sort after average wins, then after average score
    playersWithStats.sort((player1, player2) => {
        if(player2.averageWins == player1.averageWins && player2.wins == player1.wins)
            return player2.averageHits - player1.averageHits;
        else if(player2.averageWins == player1.averageWins)
            return player2.wins - player1.wins;
        
        return player2.averageWins - player1.averageWins;
    });

    // Set placement
    for (let i = 0; i < playersWithStats.length; i++){
        playersWithStats[i].placement = i;
        let playersWithSameScore = playersWithStats.filter((player) => player.averageWins == playersWithStats[i].averageWins && player.averageHits == playersWithStats[i].averageHits && player.wins == playersWithStats[i].wins);
        if(playersWithSameScore.length > 1){
            playersWithSameScore.forEach((playerWithSameScore) => {
                playerWithSameScore.placement = playersWithSameScore[0].placement;
            });
        }
    }

    // Set the first letter of each word to uppercase
    playersWithStats.forEach((player) => {
        player.name = player.name
            .split(" ")
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(" ");
    });

    return playersWithStats;
}

export const getPlayersWithStats = (openGames:Match[], oneVersusOne:boolean) => {
    let playerWithStats:PlayerWithStats[] = [];

    let allPlayers = getAllPlayers(openGames, oneVersusOne);

    allPlayers.forEach((playerName) => {
        let ammountOfMatches = getMatchesFromPlayer(openGames, playerName, oneVersusOne).length;
        let hits = getAmmountOfHitsFromPlayer(openGames, playerName, oneVersusOne);
        let wins = getAmmountOfWinsFromPlayer(openGames, playerName, oneVersusOne);

        let player = {
            name: playerName,
            hits: hits,
            ammountOfMatches: ammountOfMatches,
            ammountOfMatchesWithTrackedShots: ammountOfMatches,
            ammountOfDrunkenCups: getAmmountOfDrunkenCupsFromPlayer(openGames, playerName),
            wins: wins,
            averageWins: Math.round((ammountOfMatches == 0 ? 0 : wins / ammountOfMatches) * 100),
            averageHits: ammountOfMatches == 0 ? 0 : hits / ammountOfMatches, 
            looses: ammountOfMatches - wins,
            hitDifference: "",
            hitDifferenceNumber: 0
        };

        playerWithStats.push(player); 
    });
    
    return playerWithStats;
}

export const getAllPlayers = (openGames:Match[], oneVersusOne:boolean) => {
    let allPlayerNames:string[] = [];

    // Add all players to array
    openGames.forEach(openGame => {
        if(oneVersusOne){
            if(openGame.team1!.players.length == 1 && openGame.team2!.players.length == 1){
                allPlayerNames.push(...openGame.team1!.players.map(player => player.name));
                allPlayerNames.push(...openGame.team2!.players.map(player => player.name));
            }
        }else{
            if(openGame.team1!.players.length == 2 && openGame.team2!.players.length == 2){
                allPlayerNames.push(...openGame.team1!.players.map(player => player.name));
                allPlayerNames.push(...openGame.team2!.players.map(player => player.name));
            }
        }
    });

    allPlayerNames = allPlayerNames.map(playerName => playerName.toLowerCase());

    // Remove doublicate player names
    allPlayerNames = allPlayerNames.filter((playerName, index) => allPlayerNames.indexOf(playerName) == index);
    
    return allPlayerNames;
}

export const getMatchesFromPlayer = (openGames:Match[], playerName:string, oneVersusOne:boolean) => { 
    let matchesFromPlayer:Match[] = [];

    openGames.forEach((openGame) => {
        if(openGame.team1!.players.map(player => player.name.toLowerCase()).includes(playerName) || openGame.team2!.players.map(player => player.name.toLowerCase()).includes(playerName)){
            if(oneVersusOne){
                if(openGame.team1!.players.length == 1 || openGame.team2!.players.length == 1){
                    matchesFromPlayer.push(openGame);
                }
            }else{
                if(openGame.team1!.players.length == 2 || openGame.team2!.players.length == 2){
                    matchesFromPlayer.push(openGame);
                }
            }
        }
    });

    return matchesFromPlayer;
}

export const getAmmountOfWinsFromPlayer = (openGames:Match[], playerName:string, oneVersusOne:boolean) => {
    let wins = 0;
    
    let matches = getMatchesFromPlayer(openGames, playerName, oneVersusOne);
    
    matches.forEach((match) => {
        if((match.team1!.players.map(player => player.name.toLowerCase()).includes(playerName))){
            let team1Score = match.team1!.players.reduce((acc, player) => acc + player.score, 0);
            let team2Score = match.team2!.players.reduce((acc, player) => acc + player.score, 0);
            if(team1Score > team2Score)
                wins ++;
        }

        if((match.team2!.players.map(player => player.name.toLowerCase()).includes(playerName))){
            let team1Score = match.team1!.players.reduce((acc, player) => acc + player.score, 0);
            let team2Score = match.team2!.players.reduce((acc, player) => acc + player.score, 0);
            if(team2Score > team1Score)
                wins ++;
        }
    });

    return wins;
}

export const getAmmountOfHitsFromPlayer = (openGames:Match[], playerName:string, oneVersusOne:boolean) => {
    let score = 0;

    let matches = getMatchesFromPlayer(openGames, playerName, oneVersusOne);

    matches.forEach((match) => {
        if(match.team1.players.map(player => player.name.toLowerCase()).includes(playerName))
            score += match.team1.players.find(player => player.name.toLowerCase() == playerName)!.score;
        if(match.team2.players.map(player => player.name.toLowerCase()).includes(playerName))
            score += match.team2.players.find(player => player.name.toLowerCase() == playerName)!.score;
    });

    return score;
}

export const getAmmountOfDrunkenCupsFromPlayer = (openGames:Match[], playerName:string) => {
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
