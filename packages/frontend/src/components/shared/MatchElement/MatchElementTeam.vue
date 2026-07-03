<template> 
    <div class="MatchElementTeam"
        :class="{
            'mt-team-loose': teamScore < opponentTeamScore,
            'mt-team-second': isTeam2
        }"
    >
        <!-- Team Header -->
        <div class="mt-team">
            <div v-if="!hideAvatars" class="flex items-center -space-x-2 mr-[8px] shrink-0">

                <!-- Team Logo -->
                <PlayerProfileAvatar
                    v-if="displayTeamLogo"
                    :name="teamName"
                    :avatarImage="teamLogo"
                    shape="square"
                    :grayscale="teamScore < opponentTeamScore"
                    class="min-w-[80px] min-h-[80px]"
                />

                <div
                    v-else
                    v-for="(player, index) in team.players"
                    :key="`${player.name}-${index}`"
                    class="cursor-pointer"
                >   
                    <PlayerProfileAvatar
                        :name="player.name"
                        shape="circle"
                        size="normal"
                        :grayscale="teamScore < opponentTeamScore"
                        class="!text-[12px] border-[2px] border-[--p-surface-0]"
                    />
                </div>
            </div>
            <div
                class="mt-team-name"
                :class="{ 'cursor-pointer': team && team.players.length === 1 }"
                @click="team && team.players.length === 1 && openPlayerProfile?.(team.players[0].name)"
            >{{ teamName }}</div>
            <div class="mt-team-score" v-if="teamScore != undefined">{{ teamScore }}</div>
        </div>

        <!-- Team Players when expanded -->
        <div v-if="team && playersVisible && team.players.length > 1">
            <div class="mt-team-player cursor-pointer" v-for="(player, index) in team.players" :key="`${player.name}-${index}`" @click.stop="openPlayerProfile?.(player.name)">
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
import { PropType, computed, inject } from 'vue';
import { getMatchScore } from "@/util/tournamentMatchFunctions";
import PlayerProfileAvatar from '@/components/frontend/playerProfile/PlayerProfileAvatar.vue';

const props = defineProps({
    match: {type: Object as PropType<Match>, required: true },
    playersVisible: {type: Boolean, required: true },
    isTeam2: {type: Boolean, required: true },
    hideAvatars: {type: Boolean, default: false},
    displayTeamLogo: {type: Boolean, default: false},
    placeholder: {type: String, default: undefined},
});

const team = computed(() => props.isTeam2 ? props.match.team2 : props.match.team1);

let teamName = computed(() => {
    if(team.value){
        if(team.value.name){
            return team.value.name;
        }else{
            return team.value.players.map(p => p.name.trim()).filter(name => name.length > 0).join(' & ');
        }
    }

    return props.placeholder || "TBD";
});

let teamScore = computed(() => {
    return getMatchScore(props.match, !props.isTeam2)!;
});

let opponentTeamScore = computed(() => {
    return getMatchScore(props.match, props.isTeam2)!;
});

let teamLogo = computed(() => {
    if(team.value && team.value.logo)
        return team.value.logo;
    return undefined;
});

const openPlayerProfile = inject<(name: string) => void>('openPlayerProfile');
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