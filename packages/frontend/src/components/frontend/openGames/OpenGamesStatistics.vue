
<template>
    <div style="padding: 15px 0px; text-align: center; color: var(--main-color); font-weight: bold; font-size: 14px;">
        Damit ein Spieler in den Statistiken erscheint, muss er mindestens 10 Spiele gespielt haben
    </div>

    <div ref="pagination" class="swiper-pagination" id="OpenGamesStatisticsSwiper-Pagination" :style="{ top: paginationTop }"/>

    <div class="flex w-full justify-center items-center pb-[20px]">
        <div class="mr-[20px]" style="color: var(--main-color)">{{  withEastGermany ? "Mit Ost-Deutschland" : "Ohne Ost-Deutschland" }}</div>
        <ToggleSwitch v-model="withEastGermany" :pt="{slider: { style: withEastGermany ? 'background-color: var(--main-color)' : 'background-color: gray'}}"/>
    </div>

    <div class="OpenGamesStatistics swiper-container" id="OpenGamesStatisticsSwiper">

        <div class="swiper-wrapper">

            <div class="rt-table swiper-slide" v-for="(openGamesStatistic, groupIndex) in openGamesStatistics" :key="groupIndex">

                <AppTable
                    :value="openGamesStatistic.stats"
                    :rowClass="getRowClass"
                    @row-click="openPlayerProfile($event.data.name)"
                    rank
                    sortField="averageWins"
                    :sortOrder="-1"
                    class="mb-[30px]"
                >
                    <Column field="name" header="Spieler" sortable :pt="{ columnTitle: { class: '!text-left' }, bodyCell: { class: '!text-left min-w-[100px] min-[901px]:min-w-[220px]' } }">
                        <template #body="slotProps">
                            <div class="ogs-player-row">
                                <Avatar class="ogs-player-avatar" :name="slotProps.data.name" :size="'xlarge'"/>
                                <span class="whitespace-pre-line">{{ slotProps.data.name.replace(" ", "\n") }}</span>
                            </div>
                        </template>
                    </Column>
                    <Column field="wins" sortable :header="labels.wins"/>
                    <Column field="ammountOfMatches" sortable :header="labels.games"/>
                    <Column field="averageHits" sortable :header="labels.hitRate">
                        <template #body="slotProps">
                            {{ slotProps.data.averageHits.toFixed(2) }}
                        </template>
                    </Column>
                    <Column field="averageWins" sortable :header="labels.winRate">
                        <template #body="slotProps">
                            {{ slotProps.data.averageWins + "%" }}
                        </template>
                    </Column>
                </AppTable>

                <Accordion>
                    <AccordionPanel value="0">
                        <AccordionHeader style="color: var(--main-color)">Spieler mit weniger als 10 Spielen</AccordionHeader>
                        <AccordionContent>
                            <div v-for="(player) in openGamesStatistic.lessThan10Games">
                                {{ player.name }} : {{ player.ammountOfMatches }}
                            </div>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>

            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, inject } from 'vue';
import { getAllTimeOpenGamesStatsList, getPlayersWithStats } from './OpenGamesUtilFunctions';
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import ToggleSwitch from 'primevue/toggleswitch';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import Column from 'primevue/column';
import Avatar from '@/components/shared/Avatar.vue';
import AppTable from '@/components/shared/AppTable.vue';
import { PODIUM_ROW_CLASSES, useTableLabels } from '@/components/shared/appTable';
import { useStickyBar } from '@/components/shared/useStickyStack';

const props = defineProps({
    openGames: {type: Object as PropType<Match[]>, required: true }
});

const openPlayerProfile = inject<(name: string) => void>('openPlayerProfile')!;

const labels = useTableLabels();

// Die 1 vs. 1 / 2 vs. 2 Auswahl klebt unter den Reitern, die Tabellenkoepfe darunter.
const pagination = ref<HTMLElement | null>(null);
const paginationTop = useStickyBar(pagination);

let withEastGermany = ref(true);

const openGamesStatistics = computed(() => {
    let filteredOpenGames = props.openGames;
    if(!withEastGermany.value){
        let eastGermanyPlayers = ["Edu Schimpf", "Alex Klein", "Linda Jahrberg", "Emely Müller", "Leo Straub", "Lea Ableitner", "Nico Sanchez"];
        filteredOpenGames = props.openGames.filter((match) => {
            let team1HasEastGermanyPlayer = match.team1.players.some((player) => eastGermanyPlayers.includes(player.name));
            let team2HasEastGermanyPlayer = match.team2.players.some((player) => eastGermanyPlayers.includes(player.name));
            return !team1HasEastGermanyPlayer && !team2HasEastGermanyPlayer;
        });
    }

    return {
        "1vs1": {
            stats: getAllTimeOpenGamesStatsList(filteredOpenGames, true),
            lessThan10Games: getPlayersWithStats(filteredOpenGames, true).filter((player) => player.ammountOfMatches < 10).sort((player1, player2) => player2.ammountOfMatches - player1.ammountOfMatches)
        },
        "2vs2": {
            stats: getAllTimeOpenGamesStatsList(filteredOpenGames, false),
            lessThan10Games: getPlayersWithStats(filteredOpenGames, false).filter((player) => player.ammountOfMatches < 10).sort((player1, player2) => player2.ammountOfMatches - player1.ammountOfMatches)
        }
    };
})

// Platz 1-3 hervorheben, gleiche Platzierung = gleiche Farbe
const getRowClass = (row: PlayerWithStats) => PODIUM_ROW_CLASSES[row.placement!] ?? '';

onMounted(async () => {
    new Swiper('#OpenGamesStatisticsSwiper',{
        modules: [Pagination],
        initialSlide: 0,
        spaceBetween: 50,
        speed: 500,
        pagination: {
            el: "#OpenGamesStatisticsSwiper-Pagination",
            clickable: true,
            renderBullet: (index, className) => {
                return '<span class="' + className + '">' + (index == 0 ? "1 vs. 1" : "2 vs. 2") + '</span>';
            }
        }
    });
})
</script>

<style lang="scss">
.OpenGames{
    .swiper-pagination, .Standings .swiper-pagination{
        position: sticky;
        padding-top: 10px;
        padding-bottom: 20px;
        display: flex;
        background-color: white;
    }
    .swiper-pagination-bullet, .Standings .swiper-pagination-bullet{
        padding: 5px 10px;
        border-radius: 0;
        width: auto;
        height: auto;
        text-align: center;
        color: var(--secondary-color);
        background-color: transparent;
        opacity: 1;
        margin: 0;
        flex: 1 1 0;
        text-align: center;
    }
    .swiper-pagination-bullet-active, .Standings .swiper-pagination-bullet-active{
        color:white;
        background: var(--main-color);
    }
}
</style>

<style lang="scss" scoped>
.OpenGamesStatistics{
   overflow: clip;
}

.ogs-player-row{
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
}
.ogs-player-avatar{
    flex: 0 0 auto;
}

.ogs-player-avatar:deep(.p-avatar){
    width: 44px;
    height: 44px;
}
</style>
