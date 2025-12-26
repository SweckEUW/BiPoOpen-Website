import axios from "axios";

/////////////
// GENERAL //
/////////////
export const getAllLeagueGames = async () => {
    let response = await axios.get("/leagueGames/get");
    if(response.status == 200)
        return response.data.leagueGames as Match[];

    return [];
}

export const addLeagueGame = async (leagueGame:Match) => {
    let response = await axios.post("/leagueGames/create", leagueGame);
    return response.status == 201
}

export const updateLeagueGame = async (leagueGame:Match) => {
    let response = await axios.patch("/leagueGames/update/" + leagueGame._id, leagueGame);
    return response.status == 200;
}
    
////////////////
// STATISTICS //
////////////////
export const getPlayersWithStats = (leagueGames:Match[], leaguePlayers: LeaguePlayer[]) => {
    let playerWithStats:PlayerWithStats[] = [];

    leaguePlayers.forEach((leaguePlayer) => {
        let ammountOfMatches = getMatchesFromPlayer(leagueGames, leaguePlayer.name).length;
        let score = getAmmountOfHitsFromPlayer(leagueGames, leaguePlayer.name);
        let wins = getAmmountOfWinsFromPlayer(leagueGames, leaguePlayer.name);
        let player = {
            name: leaguePlayer.name,
            score: score,
            ammountOfMatches: ammountOfMatches,
            ammountOfMatchesWithTrackedShots: ammountOfMatches,
            ammountOfDrunkenCups: getAmmountOfDrunkenCupsFromPlayer(leagueGames, leaguePlayer.name),
            wins: wins,
            averageScore: Math.round((ammountOfMatches == 0 ? 0 : score / ammountOfMatches) * 100) / 100, // TODO: if average is 7 show 7.00
            averageWins: Math.round((ammountOfMatches == 0 ? 0 : wins / ammountOfMatches) * 100),
        };

        playerWithStats.push(player); 
    });
    
    return playerWithStats;
}

export const getMatchesFromPlayer = (leagueGames:Match[], playerName:string) => { 
    let matchesFromPlayer:Match[] = [];

    leagueGames.forEach((leagueGame) => {
        if(leagueGame.team1!.players.map(player => player.name.toLowerCase()).includes(playerName) || leagueGame.team2!.players.map(player => player.name.toLowerCase()).includes(playerName)){
            if(leagueGame.team1!.players.length == 1 || leagueGame.team2!.players.length == 1){
                matchesFromPlayer.push(leagueGame);
            }
        }
    });

    return matchesFromPlayer;
}

export const getAmmountOfWinsFromPlayer = (leagueGames:Match[], playerName:string) => {
    let wins = 0;
    
    let matches = getMatchesFromPlayer(leagueGames, playerName);
    
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

export const getAmmountOfHitsFromPlayer = (leagueGames:Match[], playerName:string) => {
    let score = 0;

    let matches = getMatchesFromPlayer(leagueGames, playerName);

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


export const getLeagueList = (leagueMatches:Match[], leaguePlayers:LeaguePlayer[]) => {
    let playersWithStats = getPlayersWithStats(leagueMatches, leaguePlayers);

    // Sort after average hit cups per game
    playersWithStats.sort((player1, player2) => {
        return player2.wins - player1.wins;
    });

    // Sort after wins, hit difference and direct win against component
    playersWithStats.sort((player1, player2) => {
        // TODO: Implement check if player 1 vs player 2 function inside group
        // if (player1.hits == player2.hits && player1.scoreDifference == player2.scoreDifference && player1.wins == player2.wins)
        //     return checkIfPlayer1WonVsPlayer2(tournament, player1.name, player2.name) ? 1 : -1;
        // if(player1.wins == player2.wins)
        //     return player2.scoreDifference! - player1.scoreDifference!;

        return player2.wins - player1.wins;
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