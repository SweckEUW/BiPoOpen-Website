export type OpenGame = {
    team1: OpenGameTeam,
    team2: OpenGameTeam,
    time: number
}

export type OpenGameTeam = {
    players: OpenGamePlayer[]
}

export type OpenGamePlayer = {
    name: string,
    score: number
}

export type SortValueOpenGames = 'placement'|'name'|'ammountOfMatches'|'wins'|'averageScore'|'averageWins'|'ammountOfDrunkenCups';