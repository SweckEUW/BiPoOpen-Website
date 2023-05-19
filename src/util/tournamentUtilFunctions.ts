import axios from "axios";
import { shuffleArray } from "@/util/util.js";
import { getAmmountOfHitsFromPlayer, getAmmountOfMatchesFromPlayer, getAmmountOfEnemyHitsFromTeam, getAmmountOfWinsFromTeam, getHitDifferenceFromTeam, getAmmountOfHitsFromTeam } from "@/util/tournamentStatsFunctions.js"

// TOURNAMENT
export const getTournamentByName = async (tournamentName:string) => {
    let response = await axios.post("/getTournamentByName", {tournamentName: tournamentName});
    console.log(response.data.message);
    if(response.data.success)
       return response.data.tournament;
}

// TEAMS
export const addTeam = async (tournamentID:string, team:any) => {
    let response = await axios.post("/addTeam", {tournamentID: tournamentID, team: team})
    console.log(response.data.message);
    return response.data.success
}

export const editTeam = async (tournamentID:string, team:any) => {
    let response = await axios.post("/editTeam", {tournamentID: tournamentID, team: team})
    console.log(response.data.message);
    return response.data.success
}

export const removeTeam = async (tournamentID:string, teamID:any) => {
    let response = await axios.post("/removeTeam", {tournamentID: tournamentID, teamID: teamID});
    console.log(response.data.message);
    return response.data.success
}

// GROUPS
export const getGroups = (tournament:any) => {
    if(!tournament.groupPhase.groups)
        return [];

    let groups:any = [];
    tournament.groupPhase.groups.forEach((group:any, i:number) => {
        groups.push({teams: []});
        group.teams.forEach((teamHere:any) => {
            let teamTMP = tournament.teams.find((team:any) => team._id == teamHere.teamID);
            groups[i].teams.push(teamTMP);
        });
    });
    return groups;
}

export const setGroups = async (tournamentID:number, groups:any) => {
    let response = await axios.post("/setGroups", {tournamentID: tournamentID, groups: groups})
    console.log(response.data.message);
    return response.data.success;
}

export const generateRandomGroups = async (tournament:any) => {
    let groups:any = [];
    let teams:any = shuffleArray(tournament.teams);
 
    // Case: Fixed ammount of Groups
    let groupAmmount:number = tournament.groupPhase.settings.fixedGroupAmmount;
    for (let i = 0; i < groupAmmount; i++)
       groups.push({teams: []});
    for (let i = 0; i < teams.length; i++)
       groups[i%groupAmmount].teams.push({teamID: teams[i]._id});
    
    await setGroups(tournament._id, groups);  // Set Groups in Database
}

export const getGroupsWithStats = (tournament:any) => {
    let groups:any = [];
    getGroups(tournament).forEach((group:any, i:number) => {
        groups.push({teams: []});
        group.teams.forEach((team:any) => {
            let teamTMP = team;
            teamTMP.wins = getAmmountOfWinsFromTeam(tournament, teamTMP.name);
            teamTMP.games = getAmmountOfMatchesFromPlayer(tournament, teamTMP.players[0]);
            teamTMP.score = getAmmountOfHitsFromTeam(tournament, teamTMP) + " : " + getAmmountOfEnemyHitsFromTeam(tournament, teamTMP)
            teamTMP.scoreDifference = getHitDifferenceFromTeam(tournament, teamTMP);
            groups[i].teams.push(teamTMP);
        });
    });

    // Sort after wins and hit difference
    groups.forEach((group:any) => {
        group.teams = group.teams.sort((team1:any, team2:any) => {
            let score1 = getAmmountOfWinsFromTeam(tournament, team1.name);
            let score2 = getAmmountOfWinsFromTeam(tournament, team2.name);
            if(score1 == score2){
                return getHitDifferenceFromTeam(tournament, team2) - getHitDifferenceFromTeam(tournament, team1);
            }else{
                return score2 - score1;
            }
            
        });
    });

    return groups;
}

// MATCHES
export const getMatches = (tournament:any) => {
    if(!tournament.groupPhase.matches)
        return [];

    let matches:any = [];
    tournament.groupPhase.matches.forEach((matchesForGroups:any, i:number) => {
        matches.push([]);
        matchesForGroups.forEach((match:any) => {
            let matchTMP = match;
            matchTMP.team1 = tournament.teams.find((team:any) => team._id == match.team1ID);
            matchTMP.team2 = tournament.teams.find((team:any) => team._id == match.team2ID);
            matches[i].push(matchTMP);
        });
    });
    return matches;
}

export const setMatches = async (tournamentID:any, matches:any) => {
    let response = await axios.post("/setMatches", {tournamentID: tournamentID, matches: matches})
    console.log(response.data.message);
    return response.data.success  
}

export const generateRandomMatches = async (tournament:any) => {
    let matches:any = [];
    let groups = tournament.groupPhase.groups;
 
    for (let i = 0; i < groups.length; i++) {
        let matchesForGroup = [];
        let teams = groups[i].teams;
    
        for (let x = 0; x < teams.length; x++){
            for (let y = x+1; y < teams.length; y++) {
                let match = {team1ID: teams[y].teamID, team2ID: teams[x].teamID};
                matchesForGroup.push(match);
            }
        }
 
        if(teams.length == 3){
            let length = matchesForGroup.length;
            for (let x = 0; x < length; x++)
                matchesForGroup.push(matchesForGroup[x]);
        }
    
        matches.push(shuffleArray(matchesForGroup));
    }

    await setMatches(tournament._id,matches);
}

export const setGameResult = async (tournament:any, selectedMatch:any, team1Player1Score:number, team1Player2Score:number, team2Player1Score:number, team2Player2Score:number ) => {
    let result = {
       team1Score: (team1Player1Score ? team1Player1Score : 0) + (team1Player2Score ? team1Player2Score : 0),
       team1Player1Score: team1Player1Score, 
       team1Player2Score: team1Player2Score, 
 
       team2Score: (team1Player2Score ? team2Player1Score : 0) + (team2Player2Score ? team2Player2Score : 0),
       team2Player1Score: team2Player1Score, 
       team2Player2Score: team2Player2Score
    }
    let matches = tournament.groupPhase.matches;
 
    // Find selectedMatch in matches and add result 
    for (let i = 0; i < matches.length; i++) {
       for (let x = 0; x < matches[i].length; x++) {
          let match = matches[i][x];
          if(match == selectedMatch){
            matches[i][x] = selectedMatch;
            matches[i][x].result = result;
          }
       }
    }
 
    await setMatches(tournament._id, matches);
}

export const getPlayersWithStats = (tournament:any) => {
    let players = [];
    let teams = tournament.teams;
    for (let i = 0; i < teams.length; i++) {
        for (let x = 0; x < teams[i].players.length; x++) {
            players.push({
                name: teams[i].players[x],
                score: getAmmountOfHitsFromPlayer(tournament, teams[i].players[x]),
                ammountOfMatches: getAmmountOfMatchesFromPlayer(tournament, teams[i].players[x]),
                team: teams[i],
                ammountOfDrunkenCups: Math.ceil(getAmmountOfEnemyHitsFromTeam(tournament, teams[i]) / 2)
            }); 
        }
    }

    // Sort after average hit cups per game
    players.sort((player1, player2) => {
        let score1 = player1.ammountOfMatches == 0 ? 0 : player1.score / player1.ammountOfMatches;
        let score2 = player2.ammountOfMatches == 0 ? 0 : player2.score / player2.ammountOfMatches;
        return score2 - score1;
    });

    return players;
}