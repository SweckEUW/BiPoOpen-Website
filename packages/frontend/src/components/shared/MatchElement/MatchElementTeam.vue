<script setup lang="ts">
import { PropType, computed } from 'vue';
import { getMatchScore } from "@/util/tournamentMatchFunctions";
import Avatar from 'primevue/avatar';
import { getPlayerInitials, getPlayerProfileImage } from '@/components/frontend/playerProfile/PlayerProfileImageMapping';
import { getLeagueTeamForPlayer } from '@/components/frontend/league/LeaguePlayersData';

const props = defineProps({
    match: {type: Object as PropType<Match>, required: true },
    playersVisible: {type: Boolean, required: true },
    isTeam2: {type: Boolean, required: true },
    leaguePlayers: {type: Array as PropType<LeaguePlayer[]>, required: false },
});

let team = props.isTeam2 ? props.match.team2 : props.match.team1;

let teamName = computed(() => {
    if(team){
        if(team.name){
            return team.name;
        }else{
            return team.players.map(p => p.name.trim()).filter(name => name.length > 0).join(' & ');
        }
    }

    return "TBD" // TODO: Set correct Team Name in Tournament e.g. Group A Team 1
});

let teamScore = computed(() => {
    return getMatchScore(props.match, !props.isTeam2)!;
});

let opponentTeamScore = computed(() => {
    return getMatchScore(props.match, props.isTeam2)!;
});

const normalizeName = (value: string): string => value.trim().replace(/\s+/g, ' ').toLowerCase();

const getLeagueLogoForPlayer = (playerName: string): string | undefined => {
    if (!props.leaguePlayers || props.leaguePlayers.length === 0) return undefined;

    const normalizedName = normalizeName(playerName);
    const directMatch = props.leaguePlayers.find(player => normalizeName(player.name) === normalizedName);
    if (directMatch?.logo) return directMatch.logo;

    const leagueTeam = getLeagueTeamForPlayer(playerName);
    if (!leagueTeam) return undefined;

    const mappedMatch = props.leaguePlayers.find(player => normalizeName(player.name) === normalizeName(leagueTeam));
    return mappedMatch?.logo;
};

const getAvatarImage = (playerName: string): string | undefined => {
    return getLeagueLogoForPlayer(playerName) ?? getPlayerProfileImage(playerName) ?? undefined;
};
const getAvatarLabel = (playerName: string): string | undefined => {
    return getAvatarImage(playerName) ? undefined : getPlayerInitials(playerName);
};
</script>

<template> 
    <div class="MatchElementTeam"
        :class="{
            'mt-team-loose': teamScore < opponentTeamScore,
            'mt-team-second': isTeam2
        }"
    >
        <div class="mt-team">
            <div v-if="team?.players?.length" class="mt-team-player-icons">
                <Avatar
                    v-for="(player, index) in team.players"
                    :key="`${player.name}-${index}`"
                    :label="getAvatarLabel(player.name)"
                    :image="getAvatarImage(player.name)"
                    shape="circle"
                    class="mt-team-header-avatar"
                />
            </div>
            <div class="mt-team-name">{{ teamName }}</div>
            <div class="mt-team-score" v-if="teamScore != undefined">{{ teamScore }}</div>
        </div>
        <div v-if="team && playersVisible">
            <div class="mt-team-player" v-for="player in team.players">
                <Avatar :label="getAvatarLabel(player.name)" :image="getAvatarImage(player.name)" shape="circle" class="mt-team-player-avatar" />
                <div class="mt-team-player-name">{{ player.name }}</div>
                <div class="mt-team-player-score">{{ player.score }}</div>
            </div>
        </div>

    </div>
</template>

<style scoped>
.MatchElementTeam{
    color: var(--main-color);
    display: flex;
    flex-direction: column-reverse;
}
.mt-team-second{
    color: var(--secondary-color);
    flex-direction: column;
}
.mt-team-loose{
    color: var(--loose-gray);
}
.mt-team{
    font-size: 18px;
    font-weight: bold;
    display: flex;
    align-items: center;
    min-height: 34px;
}
.mt-team-player-icons{
    display: flex;
    align-items: center;
    gap: 4px;
    margin-right: 8px;
    flex-shrink: 0;
}
.mt-team-header-avatar{
    width: 24px;
    height: 24px;
    min-width: 24px;
    font-size: 10px;
}
.mt-team-name{
    width: 100%;
    align-self: flex-end;
}
.mt-team-second .mt-team-name{
    align-self: flex-start;
}
.mt-team-score, .mt-team-player-score{
    background-color: var(--main-color);
    padding: 5px;
    color: white;
    width: 35px;
    text-align: center;
}
.mt-team-second .mt-team-score, .mt-team-second .mt-team-player-score{
    background-color: var(--secondary-color);
}
.mt-team-loose .mt-team-score, .mt-team-loose .mt-team-player-score{
    background-color: var(--loose-gray);
}
.mt-team-player{
    display: flex;
    align-items: center;
}
.mt-team-player-avatar{
    width: 28px;
    height: 28px;
    min-width: 28px;
    font-size: 12px;
    margin-right: 8px;
}
.mt-team-player-name{
    width: 100%;
    padding-left: 2px;
}
.mt-team-player-score{
    padding: 0px 5px;
}

:deep(.p-avatar img) {
    object-fit: contain;
}

/*MOBILE*/
@media (width <= 900px){
    .mt-team{
        font-size: 16px;
    }
    .mt-team-player{
        font-size: 16px;
    }
}

/*MOBILE S*/
@media (width <= 360px){
    .mt-team-name{
        font-size: 14px;
    }
    .mt-team-player{
        font-size: 14px;
    }
}
</style>