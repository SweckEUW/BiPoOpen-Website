type Tournament = {
    _id: string,
    name: string,
    groupPhase: GroupPhase,
    koPhase: KoPhase,
    teams: Team[],
    settings: TournamentSettings
}

type Team = {
    _id: string,
    teamID: string,
    name: string,
    players: string[]
}

type TournamentSettings = {
    trackPlayerShots: boolean
    fixedGroupAmmount: number,
    advancingTeamsPerGroup: number,
    trackTeamShots: boolean
}

type GroupPhase = {
    groups: Group[],
    matches: Match[][]
}

type Group = {
    teams: {teamID: string}[],
}

type GroupDecoded = {
    teams: Team[],
}

type KoPhase = {
    matches: Match[][]
}

type Match = {
    _id: string,
    team1ID?: string,
    team2ID?: string,
    result?: MatchResult
}

type MatchDecoded = {
    _id: string,
    team1: Team,
    team2: Team,
    result?: MatchResult
}

type MatchResult = {
    team1Score: number,
    team1Player1Score: number,
    team1Player2Score: number,
    team2Score: number,
    team2Player1Score: number,
    team2Player2Score: number
}

type PlayerWithStats = {
    name: string;
    score: number;
    ammountOfMatches: number;
    ammountOfDrunkenCups: number;
    wins: number;
    averageScore: number;
    averageWins: number;
    placement?: number;
}

type TeamWithStats = {  
    name: string;
    players: string[];
    wins: number;
    score: string;
    games: number;
    scoreDifference: number;
    hits: number;
    placement?: number;
}

type GroupWithStats = {  
    teams: TeamWithStats[];
}

type SortValueMVP = 'averageScore'|'placement'|'score'|'ammountOfMatches'|'ammountOfDrunkenCups'|'name';
type SortValueHallOfFame = 'wins'|'placement'|'name'|'ammountOfMatches'|'averageWins';