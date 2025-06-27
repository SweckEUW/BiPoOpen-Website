<script setup lang="ts">
import { ref, PropType } from "vue"
import { GroupWithStats, Tournament } from "@/types";

defineProps({
   tournament: {type: Object as PropType<Tournament>, required: true },
   group: {type: Object as PropType<GroupWithStats>, required: true },
})

let windowWidth = ref(window.screen.width);
window.addEventListener("resize", () => {
    windowWidth.value = window.screen.width;
});
</script>

<template>
    <div class="GameStandingsGroups">

        <!-- Group Standings -->
        <table class="table table-hover caption-top">
            <thead>
                <tr>
                    <th>{{ windowWidth > 900 ? 'Platz' :'Pl.'}}</th>
                    <th>Teamname</th>
                    <th>Spieler</th>
                    <th>{{ windowWidth > 900 ? 'Siege' :'Sieg.'}}</th>
                    <th>{{ windowWidth > 900 ? 'Spiele' :'Spie.'}}</th>
                    <th v-if="tournament.settings.trackTeamShots">{{ windowWidth > 900 ? 'Trefferverhältnis' :'Trfv.'}}</th>
                    <th v-if="tournament.settings.trackTeamShots && windowWidth > 360">{{ windowWidth > 900 ? 'Trefferdifferenz' :'Trfd.'}}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(team,i) in group.teams" :key="team.name">
                    <td>{{ i+1 }}</td>
                    <td>{{team.name}}</td>
                    <td><span v-for="player in team.players">{{windowWidth > 900 ? player.name : player.name.split(" ")[0]}}</span></td>
                    <td>{{ team.wins }}</td>
                    <td>{{ team.games }}</td>
                    <td v-if="tournament.settings.trackTeamShots">{{ team.score }}</td>
                    <td v-if="tournament.settings.trackTeamShots && windowWidth > 360">{{ team.scoreDifference }}</td>
                </tr>
            </tbody>
        </table>

        <!-- <div v-if="windowWidth < 900" class="hof-explain">
            <div>*Pl. = Platz</div>
            <div>*Sieg. = Siege</div>
            <div>*Spie. = Spiele</div>
            <div>*Trfv. = Trefferverhältnis</div>
            <div v-if="windowWidth > 360">*Trfd. = Trefferdifferenz</div>
        </div> -->
    </div>
</template>

<style>
.GameStandingsGroups{
    overflow: hidden;
    padding-bottom: 30px;
}

/* Groups Table */
.GameStandingsGroups table{
    text-align: center;
}
.GameStandingsGroups table *{
    vertical-align: middle;
}
.GameStandingsGroups caption{
    font-size: 28px;
    font-weight: bold;
    color: var(--main-color);
}
.GameStandingsGroups table td{
    height: 60px;
}
.GameStandingsGroups table th{
    color: var(--main-color) !important;
}
.GameStandingsGroups tbody tr:nth-of-type(1) td{
    background: var(--secondary-color-weak);
}
.GameStandingsGroups tbody tr:nth-of-type(2) td{
    background: #e6faff;
}

.GameStandingsGroups table td{
   background-color: inherit;
}
.GameStandingsGroups table td:nth-child(3) span{
    display: block;
}
.GameStandingsGroups table td:nth-child(2){
    width: 250px;
    max-width: 250px;
}

/*MOBILE*/
@media (width <= 900px){
    .GameStandingsGroups{
        padding-bottom: 0px;
    }
    .GameStandingsGroups table *{
        font-size: 14px;
    }
    .GameStandingsGroups table td:nth-child(2){
        width: 120px;
        max-width: 120px;
    }
    .GameStandingsGroups table td:nth-child(3), .GameStandingsGroups table th:nth-child(3){
        display: none;
    }
    .GameStandingsGroups table td:nth-child(3) span{
        margin-bottom: 4px;
        margin-right: 0px;
    }
    .GameStandingsGroups table td:nth-child(6){
        width: 60px;
        min-width: 60px;
        white-space: nowrap;
    }
    .GameStandingsGroups caption{
        font-size: 22px;
    }
    .hof-explain{
        margin-top: 15px;
        font-size: 11px;
        color: var(--main-color);
    }
}


/*MOBILE S*/
@media (width <= 360px){
    .GameStandingsGroups table *{
        font-size: 13px;
    }
}

/* Table Border */
.GameStandingsGroups table {
    border-collapse: collapse;
}
.GameStandingsGroups table td {
    border: 1px solid rgba(0, 0, 0, 0.3); 
}
.GameStandingsGroups table th{
    border: 1px solid rgba(0, 0, 0, 0.3); 
    border-top: 0;
}
.GameStandingsGroups table th:first-child{
    border-left: 0;
}
.GameStandingsGroups table th:last-child{
    border-right: 0;
}
.GameStandingsGroups table tr td:first-child {
    border-left: 0;
}
.GameStandingsGroups table tr:last-child td {
    border-bottom: 0;
}
.GameStandingsGroups table tr td:last-child {
    border-right: 0;
}
</style>