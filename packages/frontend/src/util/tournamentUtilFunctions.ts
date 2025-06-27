import axios from "axios";
import { shuffleArray } from "@/util/util.js";
import { getAmmountOfHitsFromPlayer, getAmmountOfMatchesFromPlayer, getAmmountOfDrunkenCupsFromteam, getAmmountOfWinsFromTeam, getAmmountOfEnemyHitsFromTeam, checkIfTeam1WonVsTeam2, getAmmountOfHitsFromTeam, getAmmountOfWinsFromPlayer } from "@/util/tournamentStatsFunctions.js"


////////////////
// TOURNAMENT //
////////////////
export const addTournament = async (tournament:any) => {
    let response = await axios.post("/createTournament", tournament);
    console.log(response.data.message);
    return response.data.success as boolean;
}

export const getAllTournaments = async () => {
    let response = await axios.get("/tournaments")
    console.log(response.data.message);
    if(response.data.success)
        return response.data.tournaments as Tournament[];
}

export const getTournamentByName = async (tournamentName:string) => {
    let response = await axios.post("/getTournamentByName", {tournamentName: tournamentName});
    console.log(response.data.message);
    if(response.data.success)
       return response.data.tournament as Tournament;
}

export const getTournamentWithRouterID = async (id:string) => {
    let tournamentName = id.replaceAll('-',' ');
    if(id == "2020" || id == "2021" || id == "2022" || id == "2023" || id == "2024" || id == "2025" || id == "2026" || id == "2027")
        tournamentName = "Weck BiPo Open " + id;
    
    let response = await axios.post("/getTournamentByName", {tournamentName: tournamentName});
    console.log(response.data.message);
    if(response.data.success)
       return response.data.tournament as Tournament;
}


//////////////
// SETTINGS //
//////////////
export const setSettings = async (tournamentID:string, settings:TournamentSettings) => {
    let response = await axios.post("/setSettings", {tournamentID: tournamentID, settings: settings})
    console.log(response.data.message);
    return response.data.success as boolean;
}


/////////////
// PLAYERS //
/////////////
export const getPlayersWithStats = (tournament:Tournament|undefined) => {
    if(!tournament)
        return [];     

    let players:PlayerWithStats[] = [];
    let teams = getAllTeams(tournament);
    
    for (let i = 0; i < teams.length; i++) {
        for (let x = 0; x < teams[i].players.length; x++) {
            let ammountOfMatches = getAmmountOfMatchesFromPlayer(tournament, teams[i].players[x], false);
            let score = getAmmountOfHitsFromPlayer(tournament, teams[i].players[x], false);
            let wins = getAmmountOfWinsFromPlayer(tournament, teams[i].players[x], false);
            
            let player = {
                name: teams[i].players[x],
                score: score,
                ammountOfMatches: ammountOfMatches,
                ammountOfMatchesWithTrackedShots: tournament.settings.trackPlayerShots ? ammountOfMatches : 0,
                ammountOfDrunkenCups: Math.ceil(getAmmountOfDrunkenCupsFromteam(tournament, teams[i].name, false) / 2),
                wins: wins,
                averageScore: Math.round((ammountOfMatches == 0 ? 0 : score / ammountOfMatches) * 100) / 100, // TODO: if average is 7 show 7.00
                averageWins: Math.round((ammountOfMatches == 0 ? 0 : wins / ammountOfMatches) * 100) / 100,
            };

            players.push(player); 
        }
    }

    return players;
}

export const getMVPList = (tournament:Tournament) => {
    let playersWithStats = getPlayersWithStats(tournament);

    // Sort after average hit cups per game
    playersWithStats.sort((player1, player2) => {
        if(player2.averageScore == player1.averageScore)
            return player2.ammountOfDrunkenCups - player1.ammountOfDrunkenCups;

        return player2.averageScore - player1.averageScore;
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

export const getMatchesFromPlayer = (tournament:Tournament|undefined, playerName:string, onlyGroupPhase:boolean) => { 
    // This is not MatchDecoded because the result is not null!
    let matchesFromPlayer:{
        _id: string,
        team1: Team,
        team2: Team,
        result: MatchResult
    }[] = [];

    let matches = getMatchesGroupPhase(tournament)
    if(!onlyGroupPhase)
        matches = matches.concat(getMatchesKOPhase(tournament));

    matches.forEach((groups) => {
        groups.forEach((match) => {
            if(match.result){
                if(
                    match.team1.players[0] == playerName || match.team1.players[1] == playerName ||
                    match.team2.players[0] == playerName || match.team2.players[1] == playerName
                ){
                    // Workarround because compiler is not able to check if match.result is null
                    matchesFromPlayer.push({
                        _id: match._id,
                        team1: match.team1,
                        team2: match.team2,
                        result: match.result!
                    });       
                }
            }
        });
    });

    return matchesFromPlayer;
}

///////////
// TEAMS //
///////////
export const addTeam = async (tournamentID:string, team:{name: string; players: string[];}) => {
    let response = await axios.post("/addTeam", {tournamentID: tournamentID, team: team})
    console.log(response.data.message);
    return response.data.success  as boolean;
}

export const editTeam = async (tournamentID:string, team:Team) => {
    let response = await axios.post("/editTeam", {tournamentID: tournamentID, team: team})
    console.log(response.data.message);
    return response.data.success  as boolean;
}

export const removeTeam = async (tournamentID:string, teamID:string) => {
    let response = await axios.post("/removeTeam", {tournamentID: tournamentID, teamID: teamID});
    console.log(response.data.message);
    return response.data.success  as boolean;
}

export const getTeamFromID = (tournament: Tournament, teamID:string) => {
    let team = tournament.teams.find((team) => team._id == teamID);
    return team;
}

export const getTeamFromName = (tournament: Tournament, teamName:string) => {
    let team = tournament.teams.find((team) => team.name == teamName);
    return team;
}

export const getAllTeams = (tournament:Tournament|undefined) => {
    if(!tournament)
        return [];

    let teams:Team[] = [];
    tournament.teams.forEach((team:Team) => {
        teams.push(team);
    });

    return teams;
}

// returns top 4 teams as array
export const getTopTeams = (tournament:Tournament|undefined) => {
    if(!tournament)
        return [];

    let matches = getMatchesKOPhase(tournament);

    // If not all Games are played out there are no top 4 Teams
    for (let i = 0; i < matches.length; i++){
        for (let x = 0; x < matches[i].length; x++) {
            if(!matches[i][x].result){
                return [];
            }
        }
    }


    let topTeams:Team[] = [];

    if(matches.length > 0){
        let firstPlaceMatch = matches[matches.length-1][0];
        let firstPlace = firstPlaceMatch.result!.team1Score > firstPlaceMatch.result!.team2Score ? firstPlaceMatch.team1 : firstPlaceMatch.team2;
        let secondPlace = firstPlaceMatch.result!.team1Score > firstPlaceMatch.result!.team2Score ? firstPlaceMatch.team2 : firstPlaceMatch.team1;

        let thirdPlaceMatch = matches[matches.length-1][1];
        let thirdPlace = thirdPlaceMatch.result!.team1Score > thirdPlaceMatch.result!.team2Score ? thirdPlaceMatch.team1 : thirdPlaceMatch.team2;
        let fourthPlace = thirdPlaceMatch.result!.team1Score > thirdPlaceMatch.result!.team2Score ? thirdPlaceMatch.team2 : thirdPlaceMatch.team1; 

        topTeams.push(firstPlace);
        topTeams.push(secondPlace);
        topTeams.push(thirdPlace);
        topTeams.push(fourthPlace);
    }

    return topTeams;
}

export const getMatchesFromTeam = (tournament:Tournament|undefined, teamName:string, onlyGroupPhase:boolean) => { 
    // Same workarround as in getMatchesFromPlayer
    let matchesFromTeam:{
        _id: string,
        team1: Team,
        team2: Team,
        result: MatchResult
    }[] = [];

    let matches = getMatchesGroupPhase(tournament)
    if(!onlyGroupPhase)
        matches = matches.concat(getMatchesKOPhase(tournament));

    matches.forEach((groups) => {
        groups.forEach((match) => {
            if(match.result){
                if(match.team1.name == teamName || match.team2.name == teamName){
                    matchesFromTeam.push({
                        _id: match._id,
                        team1: match.team1,
                        team2: match.team2,
                        result: match.result!
                    });       
                }
            }
        });
    });

    return matchesFromTeam;
}

export const getTeamsKOPhaseWithStats = (tournament:Tournament) => {
    let teams:TeamWithStats[] = [];

    let teamsKOPhase = getTeamsKOPhase(tournament);
    for (let i = 0; i < teamsKOPhase.length; i++) {
        
        let ammountOfHitsFromTeam = getAmmountOfHitsFromTeam(tournament, teamsKOPhase[i].name, false);
        let ammountOfEnemyHitsFromTeam = getAmmountOfEnemyHitsFromTeam(tournament, teamsKOPhase[i].name, false);

        let team = {
            name: teamsKOPhase[i].name,
            players: teamsKOPhase[i].players,
            wins: getAmmountOfWinsFromTeam(tournament, teamsKOPhase[i].name, false),
            games: getAmmountOfMatchesFromPlayer(tournament, teamsKOPhase[i].players[0], false),
            score: ammountOfHitsFromTeam + " : " + ammountOfEnemyHitsFromTeam,
            scoreDifference: ammountOfHitsFromTeam - ammountOfEnemyHitsFromTeam,
            hits: ammountOfHitsFromTeam,
        }        

        teams.push(team);
    }


    // Sort after ammount of games, wins
    teams = teams.sort((team1, team2) => {
        if(team1.games == team2.games)
            return team2.wins - team1.wins;

        return team2.games - team1.games;
    });

    // Set placement
    for (let i = 0; i < teams.length; i++) {
        teams[i].placement = i;

        // Top 4 Teams in Array
        let topTeams = getTopTeams(tournament);

        // Check if teams have the same ammount of games and give them same placement
        let isTeamInTop4 = topTeams.map((team) => team.name).includes(teams[i].name);
        if(!isTeamInTop4){
            let teamsWithSameScore = teams.filter((team) => team.games == teams[i].games);
            if(teamsWithSameScore.length > 1){
                teamsWithSameScore.forEach((teamWithSameWin) => {
                    teamWithSameWin.placement = teamsWithSameScore[0].placement;
                });
            }
        }

        // Top 4 Teams get placement from function
        if(isTeamInTop4)
            teams[i].placement = topTeams.map((team) => team.name).indexOf(teams[i].name);
    }

    // Finally sort again for placement
    teams = teams.sort((team1, team2) => {
        return team1.placement! - team2.placement!;
    });

    return teams;
}


////////////
// GROUPS //
////////////

// Use this function to get Groups, This will decode teamID into actualy Team
export const getGroupsDecoded = (tournament:Tournament|undefined) => {
    if(!tournament || !tournament.groupPhase.groups)
        return [];

    let groups:GroupDecoded[] = [];
    tournament.groupPhase.groups.forEach((group, i) => {
        let teams:Team[] = []
        groups.push({teams});
        group.teams.forEach((teamHere) => {
            let teamTMP = getTeamFromID(tournament, teamHere.teamID)!;
            groups[i].teams.push(teamTMP);
        });
    });

    return groups;
}

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

    let tournamentGroups = getGroupsDecoded(tournament);

    for (let i = 0; i < tournamentGroups.length; i++) {
        groupsWithStats.push({teams: []});
        
        for (let x = 0; x < tournamentGroups[i].teams.length; x++) {

            let ammountOfHitsFromTeam = getAmmountOfHitsFromTeam(tournament, tournamentGroups[i].teams[x].name, true);
            let ammountOfEnemyHitsFromTeam = getAmmountOfEnemyHitsFromTeam(tournament, tournamentGroups[i].teams[x].name, true);

            let team = {
                name: tournamentGroups[i].teams[x].name,
                players: tournamentGroups[i].teams[x].players,
                wins: getAmmountOfWinsFromTeam(tournament, tournamentGroups[i].teams[x].name, true),
                games: getAmmountOfMatchesFromPlayer(tournament, tournamentGroups[i].teams[x].players[0], true),
                score: ammountOfHitsFromTeam + " : " + ammountOfEnemyHitsFromTeam,
                scoreDifference: ammountOfHitsFromTeam - ammountOfEnemyHitsFromTeam,
                hits: ammountOfHitsFromTeam
            }

            groupsWithStats[i].teams.push(team);
        }
    }

    // Sort after wins, hit difference and direct win against component
    groupsWithStats.forEach((group) => {
        group.teams = group.teams.sort((team1, team2) => {
            if (team1.hits == team2.hits && team1.scoreDifference == team2.scoreDifference && team1.wins == team2.wins)
                return checkIfTeam1WonVsTeam2(tournament, team1.name, team2.name) ? 1 : -1;
            else if (team2.scoreDifference == team1.scoreDifference && team1.wins == team2.wins)
                return team2.hits - team1.hits;
            else if(team1.wins == team2.wins)
                return team2.scoreDifference - team1.scoreDifference;

            return team2.wins - team1.wins;
        });
    });
    
    return groupsWithStats;
}

// MATCHES GROUP
export const getMatchesGroupPhase = (tournament:Tournament|undefined) => {
    if(!tournament || !tournament.groupPhase.matches)
        return [];

    let matches:MatchDecoded[][] = [];
    tournament.groupPhase.matches.forEach((matchesForGroups, i) => {
        matches.push([]);
        matchesForGroups.forEach((match) => {
            matches[i].push({
                result: match.result,
                team1: getTeamFromID(tournament, match.team1ID!)!,
                team2: getTeamFromID(tournament, match.team2ID!)!,
                _id: match._id
            });
        });
    });

    return matches;
}

export const setMatchesGroupPhase = async (tournamentID:string, matches:Match[][]) => {
    let response = await axios.post("/setMatchesGroupPhase", {tournamentID: tournamentID, matches: matches})
    console.log(response.data.message);
    return response.data.success as boolean;
}

export const generateRandomMatchesGroupPhase = async (tournament:Tournament) => {
    let matches:Match[][] = [];
    let groups = getGroupsDecoded(tournament);
 
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


//////////////
// KO PHASE //
//////////////
export const getTeamsKOPhase = (tournament:Tournament) => {
    if(!tournament || !tournament.koPhase.matches)
        return [];     

    let teams:Team[] = [];

    let matchesKOPhase = getMatchesKOPhase(tournament);
    
    matchesKOPhase.forEach((stage) => {
        stage.forEach((match) => {
            if(match.team1 && !teams.includes(match.team1))
                teams.push(match.team1);

            if(match.team2 && !teams.includes(match.team2))
                teams.push(match.team2);
        });
    });

    return teams;
}

// MATCHES KO-PHASE
export const getMatchesKOPhase = (tournament:Tournament|undefined) => {
    if(!tournament || !tournament.koPhase.matches)
        return [];     

    let matches:MatchDecoded[][] = [];
    tournament.koPhase.matches.forEach((stage, i) => {
        matches.push([]);
        stage.forEach((match) => {
            matches[i].push({
                result: match.result,
                team1: getTeamFromID(tournament, match.team1ID!)!, // TODO: getTeamFromID will return undefined for KO-Matches that have placeholder Teams
                team2: getTeamFromID(tournament, match.team2ID!)!,
                _id: match._id
            });
        });
    });

    return matches;
}

export const setMatchesKOPhase = async (tournamentID:string, matches:Match[][]) => {
    let response = await axios.post("/setMatchesKOPhase", {tournamentID: tournamentID, matches: matches})
    console.log(response.data.message);
    return response.data.success as boolean;
}

export const initMatchesKOPhase = async (tournament:Tournament) => {
    let matches:Match[][] = [];
    let teamsInKOPhase = tournament.settings.advancingTeamsPerGroup * tournament.groupPhase.groups.length;

    // Check if teamsInKOPhase is a power of 2. If not, there are not enough teams to play a KO-Phase.  Choose the next power of 2 as teamsInKOPhase
    if(Math.log2(teamsInKOPhase) % 1 != 0){
        let power = 1;
        while (power < teamsInKOPhase) 
          power *= 2;
        teamsInKOPhase = power;
    }

    let stages = Math.log2(teamsInKOPhase);

    // Set Placeholder Matches without TeamIDs or Result for each Stage
    for (let i = 0; i < stages; i++){
        let ammountOfMatches = teamsInKOPhase/(Math.pow(2,i+1));
        matches.push([]);
        for (let x = 0; x < ammountOfMatches; x++) {
            let match = {_id: ""}; // Playerholder id. ID will be set by Database
            matches[i].push(match);
        }

        // Manually add game for 3rd place
        if(i == stages - 1)
            matches[i].push({_id: ""});
    }

    await setMatchesKOPhase(tournament._id, matches);
}

// Gets called when Group or KO Phase sets Game Result
// Loops over all Matches in the KO Phase and sets the TeamIDs for the next Stage
export const updateMatchesKOPhase = async (tournament:Tournament) => {
    let matchesTMP:Match[][] = [];

    let matches = tournament.koPhase.matches;
    let groupsDecoded = getGroupsDecoded(tournament);
    let groupsWithStats = getGroupsWithStats(tournament); // getGroups with stats because its sorted after wins. 

    matches.forEach((stage, i) => {
        matchesTMP.push([]);

        if(i == 0) { // First Stage 
            for (let x = 0; x < stage.length; x++) { 
                let matchTMP = stage[x];
                
                // groupNumber are the groups that are picked for the K.O-Stage. 
                // Match groups that are far away from each other so that teams that played together in groupstage wont play again in KO-Stage
                let group1Number, group2Number;
                let placeGroup1 = 0;
                let placeGroup2 = 1;
                if(x % 2 == 0){
                    group1Number = x;
                    group2Number = x + 1;
                }else{
                    group1Number = stage.length - x;
                    group2Number = stage.length - x - 1;
                }

                // 3 Groups and the best 2. advanced 
                // TODO: This is hardcoded for 3 Groups. Make it dynamic 
                if(tournament.name == "SCW 3 Karneval 2025"){
                    if(x == 0){
                        group1Number = 2;
                        group2Number = 1;
                    }
                    if(x == 1){
                        placeGroup1 = 1;
                        placeGroup2 = 0;
                        group1Number = 1;
                        group2Number = 0;
                    }
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

                // Check if all games of group are played. Get first place of picked group1 and set as team1
                if(!tournament.groupPhase.matches[group1Number].find((match) => !match.result)) 
                    matchTMP.team1ID = groupsDecoded[group1Number].teams.find(team => team.name == groupsWithStats[group1Number].teams[placeGroup1].name)!._id;
                
                // Check if all games of group are played. Get second place of picked group2 and set as team2
                if(!tournament.groupPhase.matches[group2Number].find((match) => !match.result)) 
                    matchTMP.team2ID = groupsDecoded[group2Number].teams.find(team => team.name == groupsWithStats[group2Number].teams[placeGroup2].name)!._id;

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
export const setGameResultKOPhase = async (tournament:Tournament, matchID:string, result:MatchResult) => {
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

export const checkIfTournamentFinished = (tournament:Tournament) => {
    let tournamentFinished = true;

    let matches = getMatchesGroupPhase(tournament)
    matches = matches.concat(getMatchesKOPhase(tournament));

    matches.forEach((groups) => {
        groups.forEach((match) => {
            if(!match.result)
                tournamentFinished = false;  
        });
    });

    return tournamentFinished;
}