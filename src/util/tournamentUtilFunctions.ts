import axios from "axios";
import { shuffleArray } from "@/util/util.js";
import { getAmmountOfHitsFromPlayer, getAmmountOfMatchesFromPlayer, getAmmountOfDrunkenCupsFromteam, getAmmountOfWinsFromTeam, getAmmountOfEnemyHitsFromTeam, checkIfTeam1WonVsTeam2, getAmmountOfHitsFromTeam } from "@/util/tournamentStatsFunctions.js"
import { convertNumberToCharacter } from "@/util/util.js"; 

// TOURNAMENT
export const getTournamentByName = async (tournamentName:string) => {
    let response = await axios.post("/getTournamentByName", {tournamentName: tournamentName});
    console.log(response.data.message);
    if(response.data.success)
       return response.data.tournament;
}

export const getTournamentWithRouterID = async (id:string) => {
    let tournamentName = "Weck BiPo Open " + id;
    let response = await axios.post("/getTournamentByName", {tournamentName: tournamentName});
    console.log(response.data.message);
    if(response.data.success)
       return response.data.tournament;
}

// SETTINGS
export const setSettings = async (tournamentID:string, settings:any) => {
    let response = await axios.post("/setSettings", {tournamentID: tournamentID, settings: settings})
    console.log(response.data.message);
    return response.data.success
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

export const removeTeam = async (tournamentID:string, teamID:string) => {
    let response = await axios.post("/removeTeam", {tournamentID: tournamentID, teamID: teamID});
    console.log(response.data.message);
    return response.data.success
}

export const getTeamFromID = (tournament: any, teamID:string) => {
    let team = tournament.teams.find((team:any) => team._id == teamID);
    return team;
}

export const getTeamFromName = (tournament: any, teamName:string) => {
    let team = tournament.teams.find((team:any) => team.name == teamName);
    return team;
}

// GROUPS
export const getGroups = (tournament:any) => {
    if(!tournament || !tournament.groupPhase.groups)
        return [];

    let groups:any = [];
    tournament.groupPhase.groups.forEach((group:any, i:number) => {
        groups.push({teams: []});
        group.teams.forEach((teamHere:any) => {
            let teamTMP = getTeamFromID(tournament, teamHere.teamID);
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
    let groupAmmount:number = tournament.settings.fixedGroupAmmount;
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

            let ammountOfHitsFromTeam = getAmmountOfHitsFromTeam(tournament, teamTMP._id, true);
            let ammountOfEnemyHitsFromTeam = getAmmountOfEnemyHitsFromTeam(tournament, teamTMP._id, true);

            teamTMP.wins = getAmmountOfWinsFromTeam(tournament, teamTMP.name, true);
            teamTMP.games = getAmmountOfMatchesFromPlayer(tournament, teamTMP.players[0], true);
            teamTMP.score = ammountOfHitsFromTeam + " : " + ammountOfEnemyHitsFromTeam;
            teamTMP.scoreDifference = ammountOfHitsFromTeam - ammountOfEnemyHitsFromTeam;
            teamTMP.hits = ammountOfHitsFromTeam;
            groups[i].teams.push(teamTMP);
        });
    });

    // Sort after wins, hit difference and direct win against component
    groups.forEach((group:any) => {
        group.teams = group.teams.sort((team1:any, team2:any) => {
            if (team1.hits == team2.hits && team1.scoreDifference == team2.scoreDifference && team1.wins == team2.wins)
                return checkIfTeam1WonVsTeam2(tournament, team1._id, team2._id);
            else if (team2.scoreDifference == team1.scoreDifference && team1.wins == team2.wins)
                return team2.hits - team1.hits;
            else if(team1.wins == team2.wins)
                return team2.scoreDifference - team1.scoreDifference;

            return team2.wins - team1.wins;
        });
    });
    
    return groups;
}

// MATCHES GROUP
export const getMatchesGroupPhase = (tournament:any) => {
    if(!tournament || !tournament.groupPhase.matches)
        return [];

    let matches:any = [];
    tournament.groupPhase.matches.forEach((matchesForGroups:any, i:number) => {
        matches.push([]);
        matchesForGroups.forEach((match:any) => {
            matches[i].push({
                result: match.result,
                team1: getTeamFromID(tournament, match.team1ID),
                team2: getTeamFromID(tournament, match.team2ID),
                _id: match._id
            });
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
        
        // Groups with 3 teams = Hin und Rückrunde
        // if(teams.length == 3){
        //     let length = matchesForGroup.length;
        //     for (let x = 0; x < length; x++)
        //         matchesForGroup.push(matchesForGroup[x]);
        // }
    
        matches.push(shuffleArray(matchesForGroup));
    }

    await setMatchesGroupPhase(tournament._id,matches);
}

export const setGameResultGroupPhase = async (tournament:any, matchID:string, result:any) => {
    // Find match in matches and add result 
    let matches = tournament.groupPhase.matches;
    for (let i = 0; i < matches.length; i++) {
        for (let x = 0; x < matches[i].length; x++) {
            if(matchID == matches[i][x]._id)
                matches[i][x].result = result;   
        }
    }

    await setMatchesGroupPhase(tournament._id, matches);
    await updateMatchesKOPhase(tournament);
}

// MATCHES KO-PHASE
export const getMatchesKOPhase = (tournament:any) => {
    if(!tournament || !tournament.koPhase.matches)
        return [];     

    let matches:any = [];
    tournament.koPhase.matches.forEach((stage:any, i:number) => {
        matches.push([]);
        stage.forEach((match:any) => {
            matches[i].push({
                placeHolderTeam1: match.placeHolderTeam1,
                placeHolderTeam2: match.placeHolderTeam2,
                result: match.result,
                team1: getTeamFromID(tournament, match.team1ID),
                team2: getTeamFromID(tournament, match.team2ID),
                _id: match._id
            });
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
    let teamsInKOPhase = tournament.settings.advancingTeamsPerGroup * tournament.groupPhase.groups.length;
    let stages = Math.log2(teamsInKOPhase);
    for (let i = 0; i < stages; i++){
        let ammountOfMatches = teamsInKOPhase/(Math.pow(2,i+1));
        matches.push([]);
        if(i == 0){
            for (let x = 0; x < ammountOfMatches; x++) {
                let group1Letter, group2Letter;
                if(x % 2 == 0){
                    group1Letter = convertNumberToCharacter(x + 1);
                    group2Letter = convertNumberToCharacter(x + 2);
                }else{
                    group1Letter = convertNumberToCharacter(ammountOfMatches - x + 1);
                    group2Letter = convertNumberToCharacter(ammountOfMatches - x);
                }
                matches[i].push({placeHolderTeam1: "1. Platz - Gruppe "  + group1Letter, placeHolderTeam2: "2. Platz - Gruppe "  + group2Letter});
            }
        }else{
            for (let x = 0; x < ammountOfMatches; x++)
                matches[i].push({placeHolderTeam1: "TBD", placeHolderTeam2: "TBD"});

            if(i == stages - 1)
                matches[i].push({placeHolderTeam1: "TBD", placeHolderTeam2: "TBD"});
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
            for (let x = 0; x < stage.length; x++) { 
                    let matchTMP = stage[x];

                    let group1Number, group2Number;
                    if(x % 2 == 0){
                        group1Number = x;
                        group2Number = x + 1;
                    }else{
                        group1Number = stage.length - x;
                        group2Number = stage.length - x - 1;
                    }

                    // Change first K.o-Stage for 2022 tournament
                    if(tournament.name == "Weck BiPo Open 2022"){
                        if(x == 0){
                            group1Number = 2;
                            group2Number = 0;
                        }
                        if(x == 1){
                            group1Number = 3;
                            group2Number = 1;
                        }
                        if(x == 2){
                            group1Number = 0;
                            group2Number = 3;
                        }
                        if(x == 3){
                            group1Number = 1;
                            group2Number = 2;
                        }
                    }

                    if(!tournament.groupPhase.matches[group1Number].find((match:any) => !match.result)) // Check if all games of group are played
                        matchTMP.team1ID = groups[group1Number].teams[0]._id;
                    
                    if(!tournament.groupPhase.matches[group2Number].find((match:any) => !match.result)) // Check if all games of group are played
                        matchTMP.team2ID = groups[group2Number].teams[1]._id;

                    matchesTMP[i].push(matchTMP); 
            }
        }else if(i == matches.length - 1){ // Last Stage (Finale, 3. Platz)
            let matchFinal = stage[0];
            let matchThirdPlace = stage[1];

            let semiFinal1 = matches[i-1][0];
            let semiFinal2 = matches[i-1][1];

            if(semiFinal1.result){
                matchFinal.team1ID = semiFinal1.result.team1Score > semiFinal1.result.team2Score ? semiFinal1.team1ID : semiFinal1.team2ID;
                matchThirdPlace.team1ID = semiFinal1.result.team1Score > semiFinal1.result.team2Score ? semiFinal1.team2ID : semiFinal1.team1ID;
            }
                
            if(semiFinal2.result){
                matchFinal.team2ID = semiFinal2.result.team1Score > semiFinal2.result.team2Score ? semiFinal2.team1ID : semiFinal2.team2ID;
                matchThirdPlace.team2ID = semiFinal2.result.team1Score > semiFinal2.result.team2Score ? semiFinal2.team2ID : semiFinal2.team1ID;
            }

            matchesTMP[i].push(matchFinal); 
            matchesTMP[i].push(matchThirdPlace); 

        }else{ // Other Stages
            for (let x = 0; x < stage.length; x++) { 
                let matchTMP = stage[x];

                let match1 = matches[i-1][x*2];
                let match2 = matches[i-1][x*2 + 1];

                if(match1.result)
                    matchTMP.team1ID = match1.result.team1Score > match1.result.team2Score ? match1.team1ID : match1.team2ID;
                if(match2.result)
                    matchTMP.team2ID = match2.result.team1Score > match2.result.team2Score ? match2.team1ID : match2.team2ID;
                
                matchesTMP[i].push(matchTMP); 
            }   
        }
    });

    await setMatchesKOPhase(tournament._id, matchesTMP);
}

// KO-PHASE
export const setGameResultKOPhase = async (tournament:any, matchID:string, result:any) => {
    // Find match in matches and add result 
    let matches = tournament.koPhase.matches;
    for (let i = 0; i < matches.length; i++) {
        for (let x = 0; x < matches[i].length; x++) {
            if(matchID == matches[i][x]._id)
                matches[i][x].result = result;
        }
    }

    await setMatchesKOPhase(tournament._id, matches);
    await updateMatchesKOPhase(tournament);
}

// PLAYERS
export const getPlayersWithStats = (tournament:any) => {
    let players:any = [];
    let teams = tournament.teams;
    for (let i = 0; i < teams.length; i++) {
        for (let x = 0; x < teams[i].players.length; x++) {
            let player:any = {
                name: teams[i].players[x],
                score: getAmmountOfHitsFromPlayer(tournament, teams[i].players[x], false),
                ammountOfMatches: getAmmountOfMatchesFromPlayer(tournament, teams[i].players[x], false),
                ammountOfDrunkenCups: Math.ceil(getAmmountOfDrunkenCupsFromteam(tournament, teams[i], false) / 2)
            };
            player.averageScore = (player.ammountOfMatches == 0 ? 0 : player.score / player.ammountOfMatches).toFixed(2);
            players.push(player); 
        }
    }

    // Sort after average hit cups per game
    players.sort((player1:any, player2:any) => {
        if(player2.averageScore == player1.averageScore)
            return player2.ammountOfDrunkenCups - player1.ammountOfDrunkenCups;
        
        return player2.averageScore - player1.averageScore;
    });

    // Set placement
    for (let i = 0; i < players.length; i++) {
        players[i].placement = i;
        let playersWithSameScore = players.filter((player:any) => player.averageScore == players[i].averageScore && player.ammountOfDrunkenCups == players[i].ammountOfDrunkenCups)
        if(playersWithSameScore.length > 1){
            playersWithSameScore.forEach((playerWithSameScore:any) => {
                playerWithSameScore.placement = playersWithSameScore[0].placement;
            });
        }
    }

    return players;
}