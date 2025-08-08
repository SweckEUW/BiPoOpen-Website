import axios from "axios";

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

    let matches = tournament.koPhase.matches;

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
    if(!tournament)
        return [];

    // Same workarround as in getMatchesFromPlayer
    let matchesFromTeam:{
        _id: string,
        team1: Team,
        team2: Team,
        result: MatchResult
    }[] = [];

    let matches = tournament.groupPhase.matches;
    if(!onlyGroupPhase)
        matches = matches.concat(tournament.koPhase.matches);

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