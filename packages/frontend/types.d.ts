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
        time?: number;
        endTime?: number;
        turns?: Turn[];
    };

    type Team = {
        _id: string;
        name?: string;
        players: Player[];
    };

    type Player = {
        _id: string;
        logo?: string;
        name: string;
        score: number;
    };

    type Turn = {
        playerIndex: number;
        teamIndex: number;
        type: 'hit' | 'miss' | 'airball' | 'bomb' | 'bouncer' | 'trickshot' | 'onfire' | 'ballsback' | 'lastCup';
        data: HitTurn | MissTurn | AirballTurn | BombTurn | BouncerTurn | TrickshotTurn | OnFireTurn | BallsBackTurn | LastCupTurn;
        time: number; 
    };

    type HitTurn = { cupIndex: number };
    type MissTurn = { };
    type AirballTurn = { };
    type BombTurn = { cupIndex1: number, cupIndex2: number, cupIndex3: number };
    type BouncerTurn = { cupIndex1: number, cupIndex2: number };
    type TrickshotTurn = {  };
    type OnFireTurn = { cupIndex: number };
    type BallsBackTurn = { cupIndex1: number };
    type LastCupTurn = { cupIndex: number };

    // Stats
    type GroupWithStats = {  
        teams: TeamWithStats[];
    };

    type TeamWithStats = {  
        placement?: number;
        name: string;
        players: Player[];
        wins: number;
        hitDifference: string;
        hitDifferenceNumber: number;
        ammountOfMatches: number;
        hits: number;
    };

    type PlayerWithStats = {
        placement?: number;
        name: string;
        wins: number;
        looses: number;
        averageWins: number;
        hits: number;
        hitDifference: string;
        hitDifferenceNumber: number;
        averageHits: number;
        ammountOfMatches: number;
        ammountOfMatchesWithTrackedShots: number;
        ammountOfDrunkenCups: number;
    };

    type LeaguePlayer = {
        name: string;
        logo: string;
    }
    
    type SortValueLeague = 'placement'|'name'|'ammountOfMatches'|'wins'|'looses';
    type SortValueMVP = 'averageHits'|'placement'|'hits'|'ammountOfMatches'|'ammountOfDrunkenCups'|'name';
    type SortValueHallOfFame = 'averageHits'|'wins'|'placement'|'name'|'ammountOfMatches'|'averageWins';
    type SortValueOpenGames = 'placement'|'name'|'ammountOfMatches'|'wins'|'averageHits'|'averageWins'|'ammountOfDrunkenCups';

    // Player Profile Types
    type TrendPeriod = 'all' | '1m' | '3m' | '6m' | '1y';

    type TrendData = {
        winrateTrend: number | null;
        averageHitsTrend: number | null;
        totalMatchesTrend: number | null;
        totalHitsTrend: number | null;
        avg1v1Trend: number | null;
        avg2v2Trend: number | null;
    };

    type CategoryStats = {
        name: string;
        matches: number;
        wins: number;
        hits: number;
        averageHits: number;
    };

    type TurnAnalysis = {
        hit: number;
        miss: number;
        airball: number;
        bomb: number;
        bouncer: number;
        trickshot: number;
        onfire: number;
        ballsback: number;
        lastCup: number;
        total: number;
    };

    type CupHeatmap = number[];

    type PartnerData = {
        name: string;
        matches: number;
        wins: number;
        losses: number;
    };

    type TimeOfDayBlock = {
        label: string;
        wins: number;
        losses: number;
        total: number;
        winrate: number;
    };

    type ExtraStats = {
        fastestWinMinutes: number | null;
        bestTimeOfDay: string | null;
        bestTimeWinrate: number | null;
        longestLosingStreak: number;
        timeOfDayStats: TimeOfDayBlock[];
        mostActiveTimeOfDay: string | null;
        mostActiveGames: number | null;
    };

    type MatchHistoryEntry = {
        match: Match;
        source: string;
        time: number;
    };

    type RivalData = {
        name: string;
        wins: number;
        losses: number;
        matches: number;
    };

    type PlayerProfileData = {
        name: string;
        leagueTeam: string | null;
        totalMatches: number;
        totalWins: number;
        totalLosses: number;
        winrate: number;
        totalHits: number;
        averageHits: number;
        currentWinStreak: number;
        bestWinStreak: number;
        trends: TrendData;
        categories: CategoryStats[];
        recentForm: ('W' | 'L')[];
        matchHistory: MatchHistoryEntry[];
        rivals: RivalData[];
        partners: PartnerData[];
        turnAnalysis: TurnAnalysis;
        cupHeatmap: CupHeatmap;
        extraStats: ExtraStats;
        badges: PlayerBadge[];
    };

    type PlayerBadge = {
        id: string;
        icon: string;
        label: string;
        description: string;
        date: string | null;
    };
}
