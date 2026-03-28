<template> 
    <div class="MatchElementTeam"
        :class="{
            'mt-team-loose': teamScore < opponentTeamScore,
            'mt-team-second': isTeam2
        }"
    >
        <div class="mt-team">
            <div v-if="!hideAvatars" class="flex items-center -space-x-2 mr-[8px] shrink-0">
                <PlayerProfileAvatar
                    v-for="(player, index) in team.players"
                    :key="`${player.name}-${index}`"
                    :name="player.name"
                    shape="circle"
                    size="normal"
                    :grayscale="teamScore < opponentTeamScore"
                    class="!text-[12px] border-[2px] border-[--p-surface-0]"
                />
            </div>
            <div class="mt-team-name">{{ teamName }}</div>
            <div class="mt-team-score" v-if="teamScore != undefined">{{ teamScore }}</div>
        </div>
        <div v-if="team && playersVisible && team.players.length > 1">
            <div class="mt-team-player" v-for="player in team.players">
                <PlayerProfileAvatar
                    v-if="!hideAvatars"
                    :name="player.name"
                    shape="circle"
                    size="normal"
                    class="!text-[12px] !w-[32px] !h-[32px] !min-w-[32px] shrink-0"
                    :grayscale="teamScore < opponentTeamScore"
                />
                <div class="mt-team-player-name">{{ player.name }}</div>
                <div class="mt-team-player-score">{{ player.score }}</div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue';
import { getMatchScore } from "@/util/tournamentMatchFunctions";
import PlayerProfileAvatar from '@/components/frontend/playerProfile/PlayerProfileAvatar.vue';

const props = defineProps({
    match: {type: Object as PropType<Match>, required: true },
    playersVisible: {type: Boolean, required: true },
    isTeam2: {type: Boolean, required: true },
    leaguePlayers: {type: Array as PropType<LeaguePlayer[]>, required: false },
    hideAvatars: {type: Boolean, default: false},
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
</script>

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
    font-size: 15px;
    font-weight: normal;
    display: flex;
    align-items: center;
}
.mt-team-header-avatar{
    width: 24px;
    height: 24px;
    min-width: 24px;
    font-size: 10px;
}
.mt-team-name{
    width: 100%;
}
.mt-team-score, .mt-team-player-score{
    background-color: var(--main-color);
    padding: 2px 5px;
    color: white;
    width: 35px;
    min-width: 35px;
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
    gap: 4px;
}
.mt-team-player-name{
    width: 100%;
    padding-left: 6px;
}
.mt-team-player-score{
    padding: 0px 5px;
}

/*MOBILE*/
@media (width <= 900px){
    .mt-team{
        font-size: 14px;
    }
    .mt-team-player{
        font-size: 14px;
    }
}

/*MOBILE S*/
@media (width <= 360px){
    .mt-team-name{
        font-size: 13px;
    }
    .mt-team-player{
        font-size: 13px;
    }
}
</style>