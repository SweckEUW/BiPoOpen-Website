<template>
    <Modal class="team-entry-modal">
        <template #title>Teams eintragen</template>

        <template #template>
            <div class="flex justify-center overflow-visible gap-[5px]">
                <div v-for="team in 2" :key="team" class="w-full">
                    <div
                        v-for="(_, index) in (team == 1 ? ammountOfPlayersTeam1 : ammountOfPlayersTeam2)"
                        :key="index"
                        class="flex"
                    >
                        <PlayerSearchAutoComplete
                            :modelValue="(team == 1 ? playerNames.team1 : playerNames.team2)[index]"
                            @update:modelValue="val => (team == 1 ? playerNames.team1 : playerNames.team2)[index] = val"
                            placeholder="Spielername"
                            className="team-modal-autocomplete"
                            :maxResults="10"
                            :style="{ textAlign: team == 1 ? 'right' : 'left' }"
                        />
                    </div>

                    <div class="flex justify-center mt-3 mb-7">
                        <div
                            class="cursor-pointer bg-[var(--main-color)] text-white flex justify-center items-center w-[50px] h-[50px] rounded-full mx-[15px]"
                            @click="addPlayerSlot(team as 1 | 2)"
                        >+</div>
                    </div>
                </div>
            </div>
        </template>

        <template #cancle>
            <div @click="cancel">Abbrechen</div>
        </template>

        <template #confirm>
            <div @click="handleConfirm">Weiter</div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { PropType, reactive, ref } from 'vue';
import Modal from '@/components/shared/Modal.vue';
import PlayerSearchAutoComplete from '@/components/shared/PlayerSearchAutoComplete.vue';
import router from '@/router.js';

const props = defineProps({
    setMatch: { type: Function as PropType<(match: Match) => void>, required: true }
});

const ammountOfPlayersTeam1 = ref(1);
const ammountOfPlayersTeam2 = ref(1);

const playerNames = reactive<{ team1: string[]; team2: string[] }>({ team1: [''], team2: [''] });

const addPlayerSlot = (team: 1 | 2) => {
    if (team === 1) {
        ammountOfPlayersTeam1.value++;
        playerNames.team1.push('');
    } else {
        ammountOfPlayersTeam2.value++;
        playerNames.team2.push('');
    }
};

const toPlayers = (names: string[]): Player[] => {
    const players = names.map(name => ({ _id: 'placeholder', name: name.trim(), score: 0 }));
    // Bei 1v1 spielt der Spieler beide Positionen
    if (players.length === 1)
        players.push({ ...players[0] });
    return players;
};

const handleConfirm = () => {
    props.setMatch({
        _id: 'placeholder',
        team1: { _id: 'placeholder', players: toPlayers(playerNames.team1) },
        team2: { _id: 'placeholder', players: toPlayers(playerNames.team2) }
    });
};

const cancel = () => {
    router.go(-1);
};
</script>

<style scoped>
.team-modal-autocomplete {
    width: 250px;
    position: relative;
}
.team-modal-autocomplete :deep(.p-inputtext) {
    width: 100%;
    height: 50px;
    padding: 0px 20px;
    font-size: 14px;
}

@media (width <= 900px) {
    .team-entry-modal :deep(.mo-container) {
        transform: translateY(-15vh);
    }

    .team-modal-autocomplete {
        width: 100%;
        padding: 0px 4px;
    }
}
</style>
