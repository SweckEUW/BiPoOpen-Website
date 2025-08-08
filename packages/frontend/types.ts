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
}

export type Team = {
    _id: string,
    name?: string,
    players: Player[]
}

export type Player = {
    _id: string,
    name: string,
    score: number
};

// Stats
export type GroupWithStats = {  
    teams: TeamWithStats[];
}

export type TeamWithStats = {  
    name: string;
    players: Player[];
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