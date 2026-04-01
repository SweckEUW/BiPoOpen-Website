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
    return response.status == 201;
}

export const deleteLeagueGame = async (leagueGame: Match) => {
    let response = await axios.delete("/leagueGames/delete/" + leagueGame._id);
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
            if(leagueGame.team1!.players.length == 1 && leagueGame.team2!.players.length == 1){
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
        // 1. Priorität: Anzahl der Siege (wins)
        if (player1.wins !== player2.wins) {
            return player2.wins - player1.wins;
        }

        // 2. Priorität: Trefferdifferenz (hitDifferenceNumber)
        if (player1.hitDifferenceNumber !== player2.hitDifferenceNumber) {
            return player2.hitDifferenceNumber - player1.hitDifferenceNumber;
        }

        // 3. Priorität: Erzielte Treffer (Mehr ist besser)
        // HINWEIS: Ersetze 'hitsWon' mit deiner Variable für die eigenen Treffer
        const p1OwnHits = parseInt(player1.hitDifference.split(':')[0]);
        const p2OwnHits = parseInt(player2.hitDifference.split(':')[0]);

        return p2OwnHits - p1OwnHits;
    });
    

    // Set placement
    for (let i = 0; i < playersWithStats.length; i++) {
        playersWithStats[i].placement = i;

        let playersWithSameScore = playersWithStats.filter((player) => 
            player.wins == playersWithStats[i].wins && 
            player.hitDifferenceNumber == playersWithStats[i].hitDifferenceNumber &&
            player.hitDifference.split(':')[0] == playersWithStats[i].hitDifference.split(':')[0]
        )
        if(playersWithSameScore.length > 1){
            playersWithSameScore.forEach((playerWithSameScore) => {
                playerWithSameScore.placement = playersWithSameScore[0].placement;
            });
        }
    }

    return playersWithStats;
}

const getLeagueMatchupKey = (match: Match) => {
    const team1Name = match.team1.players[0]?.name?.toLocaleLowerCase() ?? '';
    const team2Name = match.team2.players[0]?.name?.toLocaleLowerCase() ?? '';

    return [team1Name, team2Name].sort().join('::');
}

export const splitLeagueGamesByRound = (leagueMatches: Match[]) => {
    const sorted1v1Matches = leagueMatches
        .filter((match) => match.team1.players.length === 1 && match.team2.players.length === 1)
        .map((match, index) => ({ match, index }))
        .sort((a, b) => {
            const aTime = a.match.time ?? Number.MAX_SAFE_INTEGER;
            const bTime = b.match.time ?? Number.MAX_SAFE_INTEGER;

            if (aTime !== bTime)
                return aTime - bTime;

            return a.index - b.index;
        })
        .map(entry => entry.match);

    const matchCountsByMatchup: Record<string, number> = {};
    const hinrunde: Match[] = [];
    const rueckrunde: Match[] = [];

    sorted1v1Matches.forEach((match) => {
        const matchupKey = getLeagueMatchupKey(match);
        const playedCount = (matchCountsByMatchup[matchupKey] || 0) + 1;
        matchCountsByMatchup[matchupKey] = playedCount;

        if (playedCount === 1)
            hinrunde.push(match);
        if (playedCount === 2)
            rueckrunde.push(match);
    });

    return {
        hinrunde,
        rueckrunde
    };
}