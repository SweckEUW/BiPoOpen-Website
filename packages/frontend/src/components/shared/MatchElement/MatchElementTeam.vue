<template>
    <div class="MatchElementTeam"
        :class="{
            'mt-team-win': isWinner,
            'mt-team-loose': isLoser
        }"
    >
        <!-- Team Header -->
        <div class="mt-team">
            <div v-if="!hideAvatars" class="mt-team-avatars">

                <!-- Team Logo -->
                <Avatar
                    v-if="teamLogo && team"
                    :name="teamName"
                    :avatarImage="teamLogo"
                    :shape="avatarShape"
                    :grayscale="isLoser"
                    class="!w-[30px] !h-[30px] !min-w-[30px]"
                />

                <template v-else-if="team">
                    <Avatar
                        v-for="(player, index) in team.players"
                        :key="`${player.name}-${index}`"
                        :name="player.name"
                        :shape="avatarShape"
                        size="normal"
                        :grayscale="isLoser"
                        class="!w-[28px] !h-[28px] !min-w-[28px] !text-[11px] border-[2px] border-[--p-surface-0] box-content"
                    />
                </template>
            </div>
            <div
                class="mt-team-name"
                :class="{ 'cursor-pointer': team && team.players.length === 1 }"
                @click="team && team.players.length === 1 && openPlayerProfile?.(team.players[0].name)"
            >
                {{ teamName }}
            </div>
            <div class="mt-team-score">{{ teamScore ?? '–' }}</div>
        </div>

        <!-- Team Players when expanded -->
        <div v-if="team && playersVisible && team.players.length > 1" class="mt-team-players">
            <div class="mt-team-player cursor-pointer" v-for="(player, index) in team.players" :key="`${player.name}-${index}`" @click.stop="openPlayerProfile?.(player.name)">
                <Avatar
                    v-if="!hideAvatars"
                    :name="player.name"
                    :shape="avatarShape"
                    size="normal"
                    class="!text-[9px] !w-[22px] !h-[22px] !min-w-[22px] shrink-0"
                    :grayscale="isLoser"
                />
                <div class="mt-team-player-name">{{ player.name }}</div>
                <div class="mt-team-player-score">{{ formatPlayerScore(player.score) }}</div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { PropType, computed, inject } from 'vue';
import { getMatchScore } from "@/util/tournamentMatchFunctions";
import Avatar from '@/components/shared/Avatar.vue';

const props = defineProps({
    match: {type: Object as PropType<Match>, required: true },
    playersVisible: {type: Boolean, required: true },
    isTeam2: {type: Boolean, required: true },
    hideAvatars: {type: Boolean, default: false},
    placeholder: {type: String, default: undefined},
    avatarShape: {type: String as () => 'circle' | 'square', default: 'circle'},
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

let teamScore = computed<number | undefined>(() => {
    return getMatchScore(props.match, !props.isTeam2);
});

let opponentTeamScore = computed<number | undefined>(() => {
    return getMatchScore(props.match, props.isTeam2);
});

const isWinner = computed(() => teamScore.value != undefined && opponentTeamScore.value != undefined && teamScore.value > opponentTeamScore.value);
const isLoser = computed(() => teamScore.value != undefined && opponentTeamScore.value != undefined && teamScore.value < opponentTeamScore.value);

let teamLogo = computed(() => {
    if(team.value && team.value.logo)
        return team.value.logo;
    return undefined;
});

// 6.5 -> "6,5"
const formatPlayerScore = (score: number | undefined) => score == undefined ? '–' : score.toLocaleString('de-DE');

const openPlayerProfile = inject<(name: string) => void>('openPlayerProfile');
</script>

<style scoped>
.MatchElementTeam{
    display: flex;
    flex-direction: column;
    color: #4a5058;
}
.mt-team{
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 32px;
    font-size: 15px;
}
.mt-team-avatars{
    display: flex;
    align-items: center;
    flex-shrink: 0;
}
.mt-team-avatars > * + *{
    margin-left: -10px;
}
.mt-team-name{
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
    line-height: 1.25;
}
.mt-team-win .mt-team-name{
    font-weight: 700;
    color: #1f2328;
}

/* Ergebnis-Box: Sieger rot, sonst neutral grau */
.mt-team-score{
    min-width: 30px;
    height: 26px;
    padding: 0 6px;
    border-radius: 6px;
    background: #ECEEF1;
    color: #1f2328;
    font-size: 15px;
    font-weight: 600;
    line-height: 26px;
    text-align: center;
    flex-shrink: 0;
}
.mt-team-win .mt-team-score{
    background: var(--main-color);
    color: white;
    font-weight: 700;
}

/* Aufgeklappte Spieler mit Wuerfen */
.mt-team-players{
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 4px 0 6px 38px;
}
.mt-team-player{
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 24px;
    font-size: 13px;
    color: #4a5058;
}
.mt-team-player-name{
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
}
.mt-team-player-score{
    min-width: 30px;
    text-align: center;
    color: #1f2328;
    flex-shrink: 0;
}

/*MOBILE*/
@media (width <= 900px){
    .mt-team{
        font-size: 14px;
    }
}

/*MOBILE S*/
@media (width <= 360px){
    .mt-team-name{
        font-size: 13px;
    }
    .mt-team-players{
        padding-left: 20px;
    }
}
</style>
