import { Tournament, TournamentSettings } from "@/types";
import axios from "axios";

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
        console.log(response.data.tournament);
        return response.data.tournament as Tournament;
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
            if(!match.result)
                tournamentFinished = false;  
        });
    });

    return tournamentFinished;
}