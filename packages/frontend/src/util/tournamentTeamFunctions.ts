import axios from "axios";
import { checkIfMatchFinished } from "@/util/tournamentMatchFunctions";

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

export const getFinishedMatchesFromTeam = (tournament:Tournament|undefined, teamName:string, onlyGroupPhase:boolean) => { 
    if(!tournament)
        return [];

    let matchesFromTeam:Match[] = [];

    let matches = tournament.groupPhase.matches;
    if(!onlyGroupPhase)
        matches = matches.concat(tournament.koPhase.matches);

    matches.forEach((groups) => {
        groups.forEach((match) => {
            if(checkIfMatchFinished(match)){
                if(match.team1.name == teamName || match.team2.name == teamName){
                    matchesFromTeam.push(match);    
                }
            }
        });
    });

    return matchesFromTeam;
}