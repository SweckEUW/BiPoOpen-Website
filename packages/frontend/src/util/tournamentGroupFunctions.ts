// @ts-nocheck

import { getAmmountOfEnemyHitsFromTeam, getAmmountOfHitsFromTeam, getAmmountOfMatchesFromPlayer, getAmmountOfWinsFromTeam } from "@/util/tournamentStatsFunctions";
import { updateMatchesKOPhase } from "@/util/tournamentKOPhaseFunctions";
import { shuffleArray } from "@/util/util";
import axios from "axios";

export const setGroups = async (tournamentID:string, groups:Group[]) => {
    let response = await axios.post("/setGroups", {tournamentID: tournamentID, groups: groups})
    console.log(response.data.message);
    return response.data.success as boolean;
}

export const generateRandomGroups = async (tournament:Tournament) => {
    let groups:Group[] = [];
    let teams:Team[] = shuffleArray(tournament.teams);
 
    // Case: Fixed ammount of Groups
    let groupAmmount = tournament.settings.fixedGroupAmmount;
    for (let i = 0; i < groupAmmount; i++)
       groups.push({teams: []});
    for (let i = 0; i < teams.length; i++)
       groups[i%groupAmmount].teams.push({teamID: teams[i]._id});
    
    await setGroups(tournament._id, groups);  // Set Groups in Database
}

export const getGroupsWithStats = (tournament:Tournament|undefined) => {
    let groupsWithStats:GroupWithStats[] = [];

    let tournamentGroups = tournament?.groupPhase.groups!;
    
    for (let i = 0; i < tournamentGroups.length; i++) {
        groupsWithStats.push({teams: []});
        
        for (let x = 0; x < tournamentGroups[i].teams.length; x++) {
            let teamName = tournamentGroups[i].teams[x].name!;
            let ammountOfHitsFromTeam = getAmmountOfHitsFromTeam(tournament, teamName, true);
            let ammountOfEnemyHitsFromTeam = getAmmountOfEnemyHitsFromTeam(tournament, teamName, true);

            let team = {
                name: tournamentGroups[i].teams[x].name,
                players: tournamentGroups[i].teams[x].players,
                wins: getAmmountOfWinsFromTeam(tournament, teamName, true),
                ammountOfMatches: getAmmountOfMatchesFromPlayer(tournament, tournamentGroups[i].teams[x].players[0].name, true),
                hitDifference: ammountOfHitsFromTeam + " : " + ammountOfEnemyHitsFromTeam,
                hitDifferenceNumber: ammountOfHitsFromTeam - ammountOfEnemyHitsFromTeam,
                hits: ammountOfHitsFromTeam
            }

            groupsWithStats[i].teams.push(team);
        }
    }

    // Sort after wins, hit difference and direct win against component
    groupsWithStats.forEach((group) => {
        group.teams = group.teams.sort((team1, team2) => {
            if (team2.hitDifferenceNumber == team1.hitDifferenceNumber && team1.wins == team2.wins)
                return team2.hits - team1.hits;
            else if(team1.wins == team2.wins)
                return team2.hitDifferenceNumber - team1.hitDifferenceNumber;

            return team2.wins - team1.wins;
        });
    });
    
    return groupsWithStats;
}

export const setMatchesGroupPhase = async (tournamentID:string, matches:Match[][]) => {
    let response = await axios.post("/setMatchesGroupPhase", {tournamentID: tournamentID, matches: matches})
    console.log(response.data.message);
    return response.data.success as boolean;
}

export const generateRandomMatchesGroupPhase = async (tournament:Tournament) => {
    let matches:Match[][] = [];
    let groups = tournament.groupPhase.groups;
 
    for (let i = 0; i < groups.length; i++) {
        let matchesForGroup:Match[] = [];
        let teams = groups[i].teams;
        let ammountOfGames = (teams.length * (teams.length - 1)) / 2;

        if(ammountOfGames == 10){ // 5er Gruppen
            matchesForGroup.push({team1ID: teams[0]._id, team2ID: teams[1]._id, _id: ""});
            matchesForGroup.push({team1ID: teams[2]._id, team2ID: teams[3]._id, _id: ""});
            matchesForGroup.push({team1ID: teams[0]._id, team2ID: teams[4]._id, _id: ""});
            matchesForGroup.push({team1ID: teams[1]._id, team2ID: teams[3]._id, _id: ""});
            matchesForGroup.push({team1ID: teams[2]._id, team2ID: teams[4]._id, _id: ""});
            matchesForGroup.push({team1ID: teams[0]._id, team2ID: teams[3]._id, _id: ""});
            matchesForGroup.push({team1ID: teams[1]._id, team2ID: teams[2]._id, _id: ""});
            matchesForGroup.push({team1ID: teams[3]._id, team2ID: teams[4]._id, _id: ""});
            matchesForGroup.push({team1ID: teams[0]._id, team2ID: teams[2]._id, _id: ""});
            matchesForGroup.push({team1ID: teams[1]._id, team2ID: teams[4]._id, _id: ""});

        }else if(ammountOfGames == 6){ // 4er Gruppen
            matchesForGroup.push({team1ID: teams[2]._id, team2ID: teams[3]._id, _id: ""});
            matchesForGroup.push({team1ID: teams[0]._id, team2ID: teams[1]._id, _id: ""});
            matchesForGroup.push({team1ID: teams[2]._id, team2ID: teams[1]._id, _id: ""});
            matchesForGroup.push({team1ID: teams[0]._id, team2ID: teams[3]._id, _id: ""});
            matchesForGroup.push({team1ID: teams[0]._id, team2ID: teams[2]._id, _id: ""});
            matchesForGroup.push({team1ID: teams[1]._id, team2ID: teams[3]._id, _id: ""});

        }else if(ammountOfGames == 3){ // 3er Gruppen
            // Hinrunde
            matchesForGroup.push({team1ID: teams[0]._id, team2ID: teams[1]._id, _id: ""});
            matchesForGroup.push({team1ID: teams[0]._id, team2ID: teams[2]._id, _id: ""});
            matchesForGroup.push({team1ID: teams[1]._id, team2ID: teams[2]._id, _id: ""});

            // Rückrunde
            // matchesForGroup.push({team1ID: teams[0]._id, team2ID: teams[1]._id, _id: ""});
            // matchesForGroup.push({team1ID: teams[0]._id, team2ID: teams[2]._id, _id: ""});
            // matchesForGroup.push({team1ID: teams[1]._id, team2ID: teams[2]._id, _id: ""});

        }else{
            for (let x = 0; x < teams.length; x++){
                for (let y = x+1; y < teams.length; y++) {
                    let match = {team1ID: teams[y]._id, team2ID: teams[x]._id, _id: ""};
                    matchesForGroup.push(match);
                }
            }

            matchesForGroup = shuffleArray(matchesForGroup);
        }

        matches.push(matchesForGroup);
    }

    await setMatchesGroupPhase(tournament._id,matches);
}

export const setGameResultGroupPhase = async (tournament:Tournament, matchID:string, result:MatchResult) => {
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