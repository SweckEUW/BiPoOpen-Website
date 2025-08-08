export {}; // wichtig, damit TypeScript es als Modul erkennt

declare global {
    type Tournament = {
        _id: string;
        name: string;
        groupPhase: GroupPhase;
        koPhase: KoPhase;
        teams: Team[];
        settings: TournamentSettings;
    };

    type TournamentSettings = {
        trackPlayerShots: boolean;
        fixedGroupAmmount: number;
        advancingTeamsPerGroup: number;
        trackTeamShots: boolean;
    };

    type GroupPhase = {
        groups: Group[];
        matches: Match[][];
    };

    type Group = {
        teams: Team[];
    };

    type KoPhase = {
        matches: Match[][];
    };

    type Match = {
        _id: string;
        team1: Team;
        team2: Team;
        time: number?;
    };

    type Team = {
        _id: string;
        name?: string;
        players: Player[];
    };

    type Player = {
        _id: string;
        name: string;
        score: number;
    };

    // Stats
    type GroupWithStats = {  
        teams: TeamWithStats[];
    };

    type TeamWithStats = {  
        name: string;
        players: Player[];
        wins: number;
        score: string;
        games: number;
        scoreDifference: number;
        hits: number;
        placement?: number;
    };

    type PlayerWithStats = {
        name: string;
        score: number;
        ammountOfMatches: number;
        ammountOfMatchesWithTrackedShots: number;
        ammountOfDrunkenCups: number;
        wins: number;
        averageScore: number;
        averageWins: number;
        placement?: number;
    };

    type SortValueMVP = 'averageScore'|'placement'|'score'|'ammountOfMatches'|'ammountOfDrunkenCups'|'name';
    type SortValueHallOfFame = 'averageScore'|'wins'|'placement'|'name'|'ammountOfMatches'|'averageWins';
    type SortValueOpenGames = 'placement'|'name'|'ammountOfMatches'|'wins'|'averageScore'|'averageWins'|'ammountOfDrunkenCups';
}
