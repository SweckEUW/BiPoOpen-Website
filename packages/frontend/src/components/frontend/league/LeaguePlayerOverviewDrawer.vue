<template>
    <BottomSheet v-model:visible="drawerVisible" style="color: var(--main-color)">
        <template #header>
            <div class="w-full flex justify-content-center" v-if="selectedPlayer">
                <div class="flex flex-column align-items-center">
                    <div class="font-bold text-[20px]">{{ selectedPlayer.name }}</div>
                    <Image class="h-[120px]" :src="selectedPlayer.logo" preview
                        :pt="{
                            toolbar: { style: 'display: none' },
                            previewMask: { style: 'background: transparent; opacity: 0' },
                            mask: { style: 'background-color: rgba(0, 0, 0, 0.9) !important' }
                        }"
                    />
                </div>
            </div>
        </template>

        <div v-if="selectedPlayer">
            <div v-for="round in orderedRounds" :key="round.name" class="mb-[40px]">
                <div class="lg-sticky-round-block">
                    <div class="font-bold text-[24px] capitalize lg-sticky-round">{{ round.name }}</div>
                </div>

                <div class="lg-sticky-subblock lg-sticky-subblock--played">
                    <div class="font-bold text-[20px] lg-sticky-subheadline">
                        Absolvierte Spiele {{ round.data.matchesPlayed.length }}/{{ round.data.matchesPlayed.length + round.data.matchesToPlay.length }}
                    </div>
                </div>
                <div v-for="match in round.data.matchesPlayed" style="margin-top: 10px;">
                    <MatchElement :match="withLeagueTeamLogos(match)" :avatarShape="'square'" showDate>
                        <template v-if="getMatchResult(match)" #meta>
                            <Tag
                                :severity="getMatchResult(match) === 'Sieg' ? 'success' : 'danger'"
                                :value="getMatchResult(match)"
                                rounded
                                class="ml-auto"
                            />
                        </template>
                    </MatchElement>
                </div>

                <div v-if="round.data.matchesToPlay.length > 0" class="mt-[20px]">
                    <div class="lg-sticky-subblock lg-sticky-subblock--open">
                        <div class="font-bold text-[20px] lg-sticky-subheadline">Offene Spiele</div>
                    </div>
                    <div v-for="match in round.data.matchesToPlay" style="margin-top: 10px;">
                        <MatchElement :match="withLeagueTeamLogos(match)" :avatarShape="'square'"/>
                    </div>
                </div>
            </div>
        </div>
    </BottomSheet>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Image from 'primevue/image';
import BottomSheet from '@/components/shared/BottomSheet.vue';
import Tag from 'primevue/tag';
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';
import { withLeagueTeamLogos } from './LeaguePlayersData';
import { checkIfMatchFinished, checkIfTeam1WonVsTeam2 } from '@/util/tournamentMatchFunctions';

const drawerVisible = defineModel<boolean>('visible', { default: false });

const props = defineProps<{
    selectedPlayer?: LeaguePlayer;
    leaguePlayers: LeaguePlayer[];
    leagueGames: Match[];
}>();

const gamesFromSelectedLeaguePlayer = computed(() => {
    const result = {
        hinrunde: {
            matchesPlayed: [] as Match[],
            matchesToPlay: [] as Match[]
        },
        rückrunde: {
            matchesPlayed: [] as Match[],
            matchesToPlay: [] as Match[]
        }
    };

    if (!props.selectedPlayer) return result;

    const selectedPlayerName = props.selectedPlayer.name;
    const matchCounts: Record<string, number> = {};

    const allMatchesPlayed = props.leagueGames
        .filter((match) =>
            match.team1.players.some((p) => p.name === selectedPlayerName) ||
            match.team2.players.some((p) => p.name === selectedPlayerName)
        )
        .sort((a, b) => (a.time ?? 0) - (b.time ?? 0));

    allMatchesPlayed.forEach((match) => {
        const isTeam1 = match.team1.players.some((p) => p.name === selectedPlayerName);
        const opponentName = isTeam1 ? match.team2.players[0].name : match.team1.players[0].name;

        matchCounts[opponentName] = (matchCounts[opponentName] || 0) + 1;

        if (matchCounts[opponentName] === 1) result.hinrunde.matchesPlayed.push(match);
        if (matchCounts[opponentName] === 2) result.rückrunde.matchesPlayed.push(match);
    });

    props.leaguePlayers.forEach((player) => {
        if (player.name === selectedPlayerName) return;

        const played = matchCounts[player.name] || 0;

        const newMatch = {
            team1: { _id: '', players: [{ name: selectedPlayerName }] },
            team2: { _id: '', players: [{ name: player.name }] }
        } as Match;

        if (played === 0) result.hinrunde.matchesToPlay.push(newMatch);
        if (played === 0) result.rückrunde.matchesToPlay.push({ ...newMatch });
        if (played === 1) result.rückrunde.matchesToPlay.push(newMatch);
    });

    return result;
});

const orderedRounds = computed(() => {
    const games = gamesFromSelectedLeaguePlayer.value;
    if (!games) return [];

    const hinrunde = { name: 'hinrunde', data: games.hinrunde };
    const rückrunde = { name: 'rückrunde', data: games.rückrunde };

    if (games.hinrunde.matchesToPlay.length === 0) return [rückrunde, hinrunde];

    return [hinrunde, rückrunde];
});


const getMatchResult = (match: Match): 'Sieg' | 'Niederlage' | undefined => {
    if (!props.selectedPlayer || !checkIfMatchFinished(match)) return undefined;

    const selectedPlayerName = props.selectedPlayer.name;
    const isTeam1 = match.team1.players.some((p) => p.name === selectedPlayerName);
    const isTeam2 = match.team2.players.some((p) => p.name === selectedPlayerName);
    const team1Won = checkIfTeam1WonVsTeam2(match);

    if (team1Won === undefined) return undefined;
    if (isTeam1) return team1Won ? 'Sieg' : 'Niederlage';
    if (isTeam2) return team1Won ? 'Niederlage' : 'Sieg';

    return undefined;
};
</script>

<style scoped>

.lg-sticky-round-block {
    position: sticky;
    top: 0;
    z-index: 7;
    background: #fff;
    min-height: 52px;
    display: flex;
    align-items: flex-end;
    padding: 8px 0;
}

.lg-sticky-round-block::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: -10px;
    height: 10px;
    background: #fff;
}

.lg-sticky-subblock {
    position: sticky;
    top: 52px;
    z-index: 6;
    background: #fff;
    min-height: 42px;
    display: flex;
    align-items: center;
    padding: 6px 0;
}

.lg-sticky-subheadline {
    margin-top: 0;
    line-height: 1.2;
}

/* Make Avatars Bigger */
:deep(.p-avatar){
    width: 50px;
    height: 50px;
}

@media (width <= 900px) {
    .lg-sticky-round-block {
        min-height: 44px;
        padding: 6px 0;
    }

    .lg-sticky-subblock {
        top: 44px;
        min-height: 36px;
        padding: 4px 0;
    }
}
</style>
