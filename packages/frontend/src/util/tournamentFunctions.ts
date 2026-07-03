import axios from "axios";
import { checkIfMatchFinished } from "./tournamentMatchFunctions";
import { resolveTeamLogo } from "./supabaseStorage";

////////////////
// TOURNAMENT //
////////////////
export const addTournament = async (tournament:Tournament) => {
    let response = await axios.post("/tournaments/create", tournament);
    return response.status == 201;
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
    let response = await axios.post("/tournaments/setSettings", {tournamentID: tournamentID, settings: settings})
    console.log(response.data.message);
    return response.status == 201;
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
    // Resolve a team's stored logo reference to a displayable URL, in place.
    const applyTeamLogo = (team:any) => {
        if(!team)
            return;

        team.logoId = team.logo;                 // keep raw stored reference
        team.logo = resolveTeamLogo(team.logo);  // resolve to displayable URL
    };

    // Roster teams
    (tournament.teams ?? []).forEach(applyTeamLogo);

    // Group-standings teams
    for(const group of (tournament.groupPhase?.groups ?? []))
        (group.teams ?? []).forEach(applyTeamLogo);

    const setPlayerScoresFromResult = (match:any) => {
        if(!match?.result)
            return;

        const result = match.result;
        const hasPlayerBreakdown =
            typeof result.team1Player1Score === "number" &&
            typeof result.team1Player2Score === "number" &&
            typeof result.team2Player1Score === "number" &&
            typeof result.team2Player2Score === "number";

        if(!hasPlayerBreakdown)
            return;

        if(match.team1?.players?.[0])
            match.team1.players[0].score = result.team1Player1Score;
        if(match.team1?.players?.[1])
            match.team1.players[1].score = result.team1Player2Score;
        if(match.team2?.players?.[0])
            match.team2.players[0].score = result.team2Player1Score;
        if(match.team2?.players?.[1])
            match.team2.players[1].score = result.team2Player2Score;
    }

    // Set result to player scores when a player-level breakdown exists,
    // and resolve the logo for each match's teams.
    for(let i = 0; i < tournament.groupPhase.matches.length; i++) {
        let group = tournament.groupPhase.matches[i];
        for(let j = 0; j < group.length; j++) {
            let match = group[j];
            setPlayerScoresFromResult(match);
            applyTeamLogo(match.team1);
            applyTeamLogo(match.team2);
        }
    }

    for(let i = 0; i < tournament.koPhase.matches.length; i++) {
        let group = tournament.koPhase.matches[i];
        for(let j = 0; j < group.length; j++) {
            let match = group[j];
            setPlayerScoresFromResult(match);
            applyTeamLogo(match.team1);
            applyTeamLogo(match.team2);
        }
    }

    // console.log(tournament);
    return tournament as Tournament;
}