import axios from "axios";
import { checkIfMatchFinished } from "./tournamentMatchFunctions";

////////////////
// TOURNAMENT //
////////////////
export const addTournament = async (tournament:Tournament) => {
    let response = await axios.post("/tournaments/create", tournament);
    return response.data.success as boolean;
}

export const getAllTournaments = async () => {
    let response = await axios.get("/tournaments/get")
    if(response.status == 200)
        return response.data.tournaments as Tournament[];
}

export const getTournamentByName = async (tournamentName:string) => {
    if(tournamentName == "2020" || tournamentName == "2021" || tournamentName == "2022" || tournamentName == "2023" || tournamentName == "2024" || tournamentName == "2025" || tournamentName == "2026" || tournamentName == "2027")
        tournamentName = "Weck BiPo Open " + tournamentName;

    let response = await axios.get("/tournaments/get/" + tournamentName);
    if(response.status == 200){
        let tournament = response.data.tournament as Tournament;
        tournament = convertTournament(tournament);
        return tournament;
    }
}

export const setSettings = async (tournamentID:string, settings:TournamentSettings) => {
    let response = await axios.post("/setSettings", {tournamentID: tournamentID, settings: settings})
    console.log(response.data.message);
    return response.data.success as boolean;
}

export const checkIfTournamentFinished = (tournament:Tournament) => {
    let tournamentFinished = true;

    let matches = tournament.groupPhase.matches.concat(tournament.koPhase.matches);
    matches.forEach((groups) => {
        groups.forEach((match) => {
            if(!checkIfMatchFinished(match))
                tournamentFinished = false;  
        });
    });

    return tournamentFinished;
}

const convertTournament = (tournament:any) => {
    // Set result to player scores
    for(let i = 0; i < tournament.groupPhase.matches.length; i++) {
        let group = tournament.groupPhase.matches[i];
        for(let j = 0; j < group.length; j++) {
            let match = group[j];
            if(match.result){
                match.team1.players[0].score = match.result.team1Player1Score;
                match.team1.players[1].score = match.result.team1Player2Score;
                match.team2.players[0].score = match.result.team2Player1Score;
                match.team2.players[1].score = match.result.team2Player2Score;
            }
        }
    }

    for(let i = 0; i < tournament.koPhase.matches.length; i++) {
        let group = tournament.koPhase.matches[i];
        for(let j = 0; j < group.length; j++) {
            let match = group[j];
            if(match.result){
                match.team1.players[0].score = match.result.team1Player1Score;
                match.team1.players[1].score = match.result.team1Player2Score;
                match.team2.players[0].score = match.result.team2Player1Score;
                match.team2.players[1].score = match.result.team2Player2Score;
            }
        }
    }

    // console.log(tournament);
    return tournament as Tournament;
}