<script setup lang="ts">
import axios from "axios";
import { ref, onUnmounted } from "vue"

let tournament = ref();
const getTournament = async () => {
   let response = await axios.get("/tournaments")
   console.log(response.data.message);
   if(response.data.success){
      tournament.value = response.data.tournaments[0];
   }
}
getTournament();

let updateInterval = setInterval(() => {
   getTournament();
}, 1000);

onUnmounted(() => {
   clearInterval(updateInterval);
});

</script>

<template>
    <div>
        <table class="table table-hover caption-top" v-for="(group,index) in tournament?.groupPhase?.groups" :key="index">
            <caption>{{"Gruppe "+ (index + 1)}}</caption>
            <tbody>
                <tr v-for="team in group.teams" :key="team">
                    <td>{{team.name}}</td>
                    <td>
                        <span v-for="player in team.players" style="margin-right: 15px" :key="player">{{player.split(" ")[0]}}</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
</style>