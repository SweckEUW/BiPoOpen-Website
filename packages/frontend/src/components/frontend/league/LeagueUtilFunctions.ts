import axios from "axios";
import { h } from "vue";

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
        let name = leaguePlayer.name.toLocaleLowerCase();

        let ammountOfMatches = getMatchesFromPlayer(leagueGames, name).length;
        let ammountOfHitsFromPlayer = getAmmountOfHitsFromPlayer(leagueGames, name);
        let ammountOfEnemyHitsFromPlayer = getAmmountOfEnemyHitsFromPlayer(leagueGames, name);
        let wins = getAmmountOfWinsFromPlayer(leagueGames, name);

        let player = {
            name: leaguePlayer.name,
            ammountOfMatches: ammountOfMatches,
            ammountOfMatchesWithTrackedShots: ammountOfMatches,
            ammountOfDrunkenCups: getAmmountOfDrunkenCupsFromPlayer(leagueGames, name),
            wins: wins,
            looses: ammountOfMatches - wins,
            averageWins: Math.round((ammountOfMatches == 0 ? 0 : wins / ammountOfMatches) * 100),
            hits: ammountOfHitsFromPlayer,
            averageHits: ammountOfMatches === 0 ? 0 : ammountOfHitsFromPlayer / ammountOfMatches,
            hitDifference: ammountOfHitsFromPlayer + " : " + ammountOfEnemyHitsFromPlayer,
            hitDifferenceNumber: ammountOfHitsFromPlayer - ammountOfEnemyHitsFromPlayer
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

export const getAmmountOfEnemyHitsFromPlayer = (leagueGames:Match[], playerName:string) => {
    let enemyScore = 0;

    let matches = getMatchesFromPlayer(leagueGames, playerName);
    
    matches.forEach((match) => {
        if(match.team1.players.map(player => player.name.toLowerCase()).includes(playerName))
            enemyScore += match.team2.players.reduce((acc, player) => acc + player.score, 0);
        if(match.team2.players.map(player => player.name.toLowerCase()).includes(playerName))
            enemyScore += match.team1.players.reduce((acc, player) => acc + player.score, 0);
    });

    return enemyScore;
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

    // Sort after wins, hit difference and direct win against component
    playersWithStats.sort((player1, player2) => {
        if(player1.wins == player2.wins && player1.hitDifferenceNumber == player2.hitDifferenceNumber)
            return player1.name.localeCompare(player2.name);  // TODO: Replace with direct win check
        else if(player1.wins == player2.wins)
            return player2.hitDifferenceNumber - player1.hitDifferenceNumber;
        return player2.wins - player1.wins;
    });
    

    // Set placement
    for (let i = 0; i < playersWithStats.length; i++) {
        playersWithStats[i].placement = i;

        let playersWithSameScore = playersWithStats.filter((player) => player.wins == playersWithStats[i].wins && player.hitDifferenceNumber == playersWithStats[i].hitDifferenceNumber)
        if(playersWithSameScore.length > 1){
            playersWithSameScore.forEach((playerWithSameScore) => {
                playerWithSameScore.placement = playersWithSameScore[0].placement;
            });
        }
    }

    return playersWithStats;
}