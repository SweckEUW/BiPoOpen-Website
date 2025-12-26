<template>
    <Modal>
        <template #title>Teams auswählen</template>

        <template #template>
            <div class="alg-modal">
                <div v-for="i in 2" class="alg-modal-container">
                    <div class="alg-modal-team">

                        <Select :options="leaguePlayers" optionLabel="name" scrollHeight="300px" :placeholder="'Team ' + i" class="w-full h-[120px]"
                            :pt="{ overlay: { style: 'width: 90%' }, label: { style: 'display: flex; align-items: center; justify-content: center;' } }"
                        >
                            <template #value="slotProps">
                                <div v-if="slotProps.value" class="flex flex-col align-items-center">
                                    <img :src="slotProps.value.logo" class="w-[50px] h-[50px] object-contain" />
                                    <div class="whitespace-break-spaces text-center">{{ slotProps.value.name }}</div>
                                </div>
                                <span v-else class="w-full text-center">
                                    {{ slotProps.placeholder }}
                                </span>
                            </template>
                            <template #option="slotProps">
                                <div class="flex align-items-center">
                                    <img :src="slotProps.option.logo" class="w-[50px] h-[50px] object-contain mr-2"/>
                                    <div>{{ slotProps.option.name }}</div>
                                </div>
                            </template>
                        </Select>
                    </div>
                </div>
            </div>
        </template>

        <!-- Button 1 -->
        <template #cancle>
            <div @click="toggleModalAddGame();">Abbrechen</div>
        </template>

        <!-- Button 2 -->
        <template #confirm>
            <div @click="startBiPoKnecht()">Weiter</div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/shared/Modal.vue';
import Select from 'primevue/select';

const props = defineProps({
    leaguePlayers: {type: Array as () => LeaguePlayer[], required: true },
    toggleModalAddGame: {type: Function, required: true }
});

const startBiPoKnecht = async () => {
    
}
</script>

<style>
.mo-container{
    margin-bottom: 50px;
}
.alg-modal{
    overflow: hidden;
    display: flex;
    justify-content: center;
    gap: 5px;
    margin-bottom: 20px;
}
.alg-modal-container{
    width: 50%;
}
.alg-modal-team{
    display: flex; 
}
.alg-modal-container:nth-child(2) .alg-modal-team{
    flex-direction: row-reverse;
}

/*MOBILE*/
@media (width <= 900px){
    .alg-modal-team{
        white-space: break-spaces;
    }
}
</style>
