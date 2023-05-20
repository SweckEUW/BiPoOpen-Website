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

// MATCHES GROUP
export const getMatchesGroupPhase = (tournament:any) => {
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

export const setMatchesGroupPhase = async (tournamentID:any, matches:any) => {
    let response = await axios.post("/setMatchesGroupPhase", {tournamentID: tournamentID, matches: matches})
    console.log(response.data.message);
    return response.data.success  
}

export const generateRandomMatchesGroupPhase = async (tournament:any) => {
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

    await setMatchesGroupPhase(tournament._id,matches);
}

export const setGameResultGroupPhase = async (tournament:any, selectedMatch:any, team1Player1Score:number, team1Player2Score:number, team2Player1Score:number, team2Player2Score:number ) => {
    let result = {
       team1Score: (team1Player1Score ? team1Player1Score : 0) + (team1Player2Score ? team1Player2Score : 0),
       team1Player1Score: team1Player1Score, 
       team1Player2Score: team1Player2Score, 
 
       team2Score: (team1Player2Score ? team2Player1Score : 0) + (team2Player2Score ? team2Player2Score : 0),
       team2Player1Score: team2Player1Score, 
       team2Player2Score: team2Player2Score
    }

    // Find selectedMatch in matches and add result 
    let matches = tournament.groupPhase.matches;
    for (let i = 0; i < matches.length; i++) {
       for (let x = 0; x < matches[i].length; x++) {
          let match = matches[i][x];
          if(match == selectedMatch){
            matches[i][x] = selectedMatch;
            matches[i][x].result = result;
          }
       }
    }

    await setMatchesGroupPhase(tournament._id, matches);
    await updateMatchesKOPhase(tournament);
}

// MATCHES KO-PHASE
export const getMatchesKOPhase = (tournament:any) => {
    if(!tournament.koPhase.matches)
        return [];     

    let matches:any = [];
    tournament.koPhase.matches.forEach((stage:any, i:number) => {
        matches.push([]);
        stage.forEach((match:any) => {
            let matchTMP = match;
            matchTMP.team1 = tournament.teams.find((team:any) => team._id == match.team1ID);
            matchTMP.team2 = tournament.teams.find((team:any) => team._id == match.team2ID);
            matches[i].push(matchTMP);
        });
    });

    return matches;
}

export const setMatchesKOPhase = async (tournamentID:any, matches:any) => {
    let response = await axios.post("/setMatchesKOPhase", {tournamentID: tournamentID, matches: matches})
    console.log(response.data.message);
    return response.data.success  
}

export const initMatchesKOPhase = async (tournament:any) => {
    let matches:any = [];
    let teamsInKOPhase = tournament.koPhase.settings.advancingTeamsPerGroup * tournament.groupPhase.groups.length;
    let stages = Math.log2(teamsInKOPhase);
    for (let i = 0; i < stages; i++){
        let ammountOfMatches = teamsInKOPhase/(Math.pow(2,i+1));
        matches.push([]);
        for (let x = 0; x < ammountOfMatches/2; x++) {
            if(i == 0){
                matches[i].push({placeHolderTeam1: "1. Platz - Gruppe " + (x*2 + 1), placeHolderTeam2: "2. Platz - Gruppe "  + (x*2 + 2)});
                matches[i].push({placeHolderTeam1: "2. Platz - Gruppe "  + (x*2 + 1), placeHolderTeam2: "1. Platz - Gruppe "  + (x*2 + 2)});
            }else{
                matches[i].push({placeHolderTeam1: "TBA", placeHolderTeam2: "TBA"});
                matches[i].push({placeHolderTeam1: "TBA", placeHolderTeam2: "TBA"});
            }
        }
    }

    await setMatchesKOPhase(tournament._id, matches);
}

export const updateMatchesKOPhase = async (tournament:any) => {
    let matchesTMP:any = [];
    let matches:any = tournament.koPhase.matches;
    let groups:any = getGroupsWithStats(tournament);
    matches.forEach((stage:any, i:number) => {
        matchesTMP.push([]);

        if(i == 0) { // First Stage 
            for (let x = 0; x < stage.length/2; x++) { 
                for (let y = 0; y < tournament.koPhase.settings.advancingTeamsPerGroup; y++) {
                    let matchTMP = stage[x*2+y];

                    if(!tournament.groupPhase.matches[x*2].find((match:any) => !match.result))
                        matchTMP.team1ID = groups[x*2].teams[y]._id;
                    
                    if(!tournament.groupPhase.matches[x*2 + 1].find((match:any) => !match.result))
                        matchTMP.team2ID = groups[x*2 + 1].teams[y == 0 ? 1 : 0]._id;

                    matchesTMP[i].push(matchTMP); 
                }
            }
        }else{ // Next Stages
            for (let x = 0; x < stage.length; x++) { 
                let matchTMP = stage[x];

                // let match1 = matches[i-1][x*2];
                // let match2 = matches[i-1][x*2 + 1];


                // if(match1.result)
                //     matchTMP.team1ID = match1.team1Score > match1.team2Score ? match1.team1ID : match1.team2ID;
                // if(match2.result)
                //     matchTMP.team2ID = match2.team1Score > match2.team2Score ? match2.team1ID : match2.team2ID;
                      
                matchesTMP[i].push(matchTMP); 
            }   
        }
    });

    await setMatchesKOPhase(tournament._id, matchesTMP);
}

// KO-PHASE
export const setGameResultKOPhase = async (tournament:any, selectedMatch:any, team1Player1Score:number, team1Player2Score:number, team2Player1Score:number, team2Player2Score:number ) => {
    let result = {
       team1Score: (team1Player1Score ? team1Player1Score : 0) + (team1Player2Score ? team1Player2Score : 0),
       team1Player1Score: team1Player1Score, 
       team1Player2Score: team1Player2Score, 
 
       team2Score: (team1Player2Score ? team2Player1Score : 0) + (team2Player2Score ? team2Player2Score : 0),
       team2Player1Score: team2Player1Score, 
       team2Player2Score: team2Player2Score
    }

    // Find selectedMatch in matches and add result 
    let matches = tournament.koPhase.matches;
    for (let i = 0; i < matches.length; i++) {
       for (let x = 0; x < matches[i].length; x++) {
          let match = matches[i][x];
          if(match == selectedMatch){
            matches[i][x] = selectedMatch;
            matches[i][x].result = result;
          }
       }
    }
 
    await setMatchesKOPhase(tournament._id, matches);
    await updateMatchesKOPhase(tournament);
}

// PLAYERS
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