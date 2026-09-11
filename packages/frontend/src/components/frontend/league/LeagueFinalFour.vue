<template>
    <div class="LeagueFinalFour">

        <div class="tb-bracket">

            <!-- ── Halbfinale ── -->
            <div class="tb-round">
                <div class="tb-round-title">Halbfinale</div>
                <div class="tb-matches">
                    <div class="tb-pair">
                        <div class="tb-slot">
                            <div class="tb-match">
                                <FinalFourSeries
                                    :team1="seedTeams[0]"
                                    :team2="seedTeams[3]"
                                    team1Placeholder="1. der Tabelle"
                                    team2Placeholder="4. der Tabelle"
                                    :leagueGames="leagueGames"
                                />
                            </div>
                        </div>
                        <div class="tb-slot">
                            <div class="tb-match">
                                <FinalFourSeries
                                    :team1="seedTeams[1]"
                                    :team2="seedTeams[2]"
                                    team1Placeholder="2. der Tabelle"
                                    team2Placeholder="3. der Tabelle"
                                    :leagueGames="leagueGames"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ── Finale ── -->
            <div class="tb-round tb-round--connected">
                <div class="tb-round-title">Finale</div>
                <div class="tb-matches tb-final-matches">
                    <div class="tb-match">
                        <FinalFourSeries
                            :team1="semiFinalResults[0].winner"
                            :team2="semiFinalResults[1].winner"
                            team1Placeholder="Sieger Halbfinale 1"
                            team2Placeholder="Sieger Halbfinale 2"
                            :leagueGames="leagueGames"
                        />
                    </div>
                </div>
            </div>

            <div class="tb-third-place">
                <div class="tb-round-title">Spiel um Platz 3</div>
                <div class="tb-matches">
                    <div class="tb-match">
                        <FinalFourSeries
                            :team1="semiFinalResults[0].loser"
                            :team2="semiFinalResults[1].loser"
                            team1Placeholder="Verlierer Halbfinale 1"
                            team2Placeholder="Verlierer Halbfinale 2"
                            :leagueGames="leagueGames"
                        />
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import FinalFourSeries from './FinalFourSeries.vue';
import { getLeagueList } from './LeagueUtilFunctions';
import { LEAGUE_PLAYERS, LEAGUE_PLAYER_MAP } from './LeaguePlayersData';

const props = defineProps({
    leaguePlayers: { type: Array as () => LeaguePlayer[], required: true },
    leagueGames: { type: Array as () => Match[], required: true },
});

const getTeamNames = (team: Team | undefined) => team
    ? [team.name, ...team.players.map(player => player.name)].filter(Boolean).map(name => name!.toLocaleLowerCase())
    : [];

const getRegularSeasonGames = () => props.leagueGames
    .slice()
    .sort((match1, match2) => (match1.time ?? 0) - (match2.time ?? 0))
    .slice(0, 210);

const getSeriesResult = (team1: Team | undefined, team2: Team | undefined) => {
    const team1Names = getTeamNames(team1);
    const team2Names = getTeamNames(team2);
    const games = props.leagueGames
        .slice()
        .sort((match1, match2) => (match1.time ?? 0) - (match2.time ?? 0))
        .slice(210)
        .filter(match => {
            const matchTeam1Names = getTeamNames(match.team1);
            const matchTeam2Names = getTeamNames(match.team2);
            return matchTeam1Names.some(name => team1Names.includes(name)) && matchTeam2Names.some(name => team2Names.includes(name))
                || matchTeam1Names.some(name => team2Names.includes(name)) && matchTeam2Names.some(name => team1Names.includes(name));
        })
        .slice(0, 3);
    let team1Wins = 0;
    let team2Wins = 0;

    games.forEach(match => {
        const matchTeam1Score = match.team1.players.reduce((score, player) => score + (player.score ?? 0), 0);
        const matchTeam2Score = match.team2.players.reduce((score, player) => score + (player.score ?? 0), 0);
        if (matchTeam1Score === matchTeam2Score)
            return;

        const matchUsesTeam1 = getTeamNames(match.team1).some(name => team1Names.includes(name));
        if (matchUsesTeam1 === (matchTeam1Score > matchTeam2Score))
            team1Wins++;
        else
            team2Wins++;
    });

    return {
        winner: team1Wins >= 2 ? team1 : team2Wins >= 2 ? team2 : undefined,
        loser: team1Wins >= 2 ? team2 : team2Wins >= 2 ? team1 : undefined,
    };
};

// Top 4 der aktuellen Tabelle (positional, damit Ties nicht das Seeding verfaelschen).
const seedTeams = computed<(Team | undefined)[]>(() => {
    const standings = getLeagueList(getRegularSeasonGames(), props.leaguePlayers).slice(0, 4);

    return [0, 1, 2, 3].map((index) => {
        const player = standings[index];
        if (!player)
            return undefined;

        const logo = LEAGUE_PLAYERS.find(leaguePlayer => leaguePlayer.name === player.name)?.logo;
        const playerName = LEAGUE_PLAYER_MAP[player.name] ?? player.name;

        // Mock-Team ohne Score -> MatchElement zeigt "vs.".
        return {
            _id: '',
            name: player.name,
            logo,
            players: [{ _id: '', name: playerName }],
        } as unknown as Team;
    });
});

const semiFinalResults = computed(() => [
    getSeriesResult(seedTeams.value[0], seedTeams.value[3]),
    getSeriesResult(seedTeams.value[1], seedTeams.value[2]),
]);
</script>

<style scoped>
.bp-title {
    text-align: center;
}
.ff-intro {
    text-align: center;
    color: var(--main-color);
    opacity: 0.8;
    font-size: 14px;
    margin-bottom: 20px;
}

/* ── Turnierbaum (uebernommen aus der Turnier-K.o.-Phase) ── */
.tb-bracket {
    display: grid;
    grid-template-columns: minmax(350px, 1fr) minmax(350px, 1fr);
    grid-template-rows: auto auto;
    column-gap: 30px;
    overflow-x: auto;
    padding: 8px 0;
}

.tb-round {
    display: flex;
    flex-direction: column;
    min-width: 0;
}
.tb-round-title {
    font-size: 13px;
    color: var(--main-color);
    text-align: center;
    margin-bottom: 8px;
    font-weight: bold;
}

.tb-third-place-title {
    margin-top: 20px;
}

.tb-final-matches {
    flex: 1;
    align-items: center;
}

.tb-third-place {
    grid-column: 2;
    grid-row: 2;
    margin-top: 20px;
}
.tb-matches {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
}

.tb-match {
    position: relative;
    width: 100%;
}

/* Eingehende horizontale Linie aus der vorherigen Runde */
.tb-round--connected .tb-match::before {
    content: '';
    position: absolute;
    top: 50%;
    left: -15px;
    width: 15px;
    height: 2px;
    background: #ccc;
    z-index: 1;
}

/* Paar (zwei Halbfinals, die ins Finale fuehren) */
.tb-pair {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.tb-slot {
    flex: 1;
    display: flex;
    align-items: center;
    position: relative;
    padding: 4px 0;
}

/* Horizontale Linie aus dem Match nach rechts */
.tb-slot::after {
    content: '';
    position: absolute;
    top: 50%;
    right: -15px;
    width: 15px;
    height: 2px;
    background: #ccc;
}

/* Vertikaler Verbinder: oberes Slot -> zur Mitte */
.tb-slot:first-child:not(:only-child)::before {
    content: '';
    position: absolute;
    top: 50%;
    bottom: 0;
    right: -15px;
    width: 2px;
    background: #ccc;
}

/* Vertikaler Verbinder: unteres Slot -> zur Mitte */
.tb-slot:last-child:not(:only-child)::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 50%;
    right: -15px;
    width: 2px;
    background: #ccc;
}

/* ═══════ MOBILE ═══════ */
@media (width <= 900px) {
    .tb-bracket {
        grid-template-columns: minmax(200px, 1fr) minmax(200px, 1fr);
        column-gap: 24px;
    }
    .tb-round {
        min-width: 0;
    }
    .tb-slot::after {
        right: -12px;
        width: 12px;
    }
    .tb-slot:first-child:not(:only-child)::before,
    .tb-slot:last-child:not(:only-child)::before {
        right: -12px;
    }
    .tb-round--connected .tb-match::before {
        left: -12px;
        width: 12px;
    }
}
</style>
