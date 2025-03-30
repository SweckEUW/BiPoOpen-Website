export type Tournament = {
    _id: string,
    name: string,
    groupPhase: GroupPhase,
    koPhase: KoPhase,
    teams: Team[],
    settings: TournamentSettings
}

export type TournamentSettings = {
    trackPlayerShots: boolean
    fixedGroupAmmount: number,
    advancingTeamsPerGroup: number,
    trackTeamShots: boolean
}

export type GroupPhase = {
    groups: Group[],
    matches: Match[][]
}

export type Group = {
    teams: Team[],
}

export type KoPhase = {
    matches: Match[][]
}

export type Match = {
    _id: string,
    team1: Team,
    team2: Team,
    result?: MatchResult
}

export type MatchResult = {
    team1Score: number,
    team1Player1Score?: number,
    team1Player2Score?: number,
    team2Score: number,
    team2Player1Score?: number,
    team2Player2Score?: number
}

export type Team = {
    _id: string,
    name?: string,
    players: Player[]
}

export type Player = string;

// export type OpenGame = {
//     team1: OpenGameTeam,
//     team2: OpenGameTeam,
//     time: number
// }

// export type OpenGameTeam = {
//     players: OpenGamePlayer[]
// }

// export type OpenGamePlayer = {
//     name: string,
//     score: number
// }

// Stats
export type GroupWithStats = {  
    teams: TeamWithStats[];
}

export type TeamWithStats = {  
    name: string;
    players: string[];
    wins: number;
    score: string;
    games: number;
    scoreDifference: number;
    hits: number;
    placement?: number;
}

export type PlayerWithStats = {
    name: string;
    score: number;
    ammountOfMatches: number;
    ammountOfMatchesWithTrackedShots: number;
    ammountOfDrunkenCups: number;
    wins: number;
    averageScore: number;
    averageWins: number;
    placement?: number;
}