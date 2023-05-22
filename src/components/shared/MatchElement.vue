<script setup lang="ts">
const props = defineProps(['match','toggleModal','index',"isBackend"])
</script>

<template>
    <div class="Match">

        <!-- Team 1 -->
        <div class="gsk-match-team" :style="{'background' : match.result ? match.result.team1Score > match.result.team2Score ? 'var(--result-green)' : 'var(--result-red)' : ''}">
            <div v-if="index == 0 || !match.team1" class="gsk-match-placeholder">{{ match.placeHolderTeam1 }}</div>
            <div v-if="match.team1" >
                <div>{{match.team1.name}}</div>
                <div v-for="player in match.team1.players" :key="player">{{ player }}</div>
            </div>
        </div>

        <!-- Result -->
        <div v-if="!match.result && match.team1 && match.team2">
            <div v-if="isBackend " class="bp-button gsk-button" @click="toggleModal(match)">Eintragen</div>
            <div v-else class="gsk-result">vs.</div>
        </div>
        <div v-else-if="!match.result" style="padding: 10px;">vs.</div>
        <div class="gsk-result" v-else @click="isBackend ? toggleModal(match) : ''" :style="{'background' : match.result ? match.result.team1Score > match.result.team2Score ? 'linear-gradient(90deg, var(--result-green), var(--result-red))' : 'linear-gradient(90deg, var(--result-red), var(--result-green))' : ''}">
            <div>{{match.result.team1Score + " - " + match.result.team2Score}}</div>
            <div>{{match.result.team1Player1Score + " - " + match.result.team2Player1Score}}</div>
            <div>{{match.result.team1Player2Score + " - " + match.result.team2Player2Score}}</div>
        </div>

        <!-- Team 2 -->
        <div class="gsk-match-team" :style="{'background' : match.result ? match.result.team2Score > match.result.team1Score ? 'var(--result-green)' : 'var(--result-red)' : ''}">
         <div v-if="index == 0 || !match.team2" class="gsk-match-placeholder">{{ match.placeHolderTeam2 }}</div>
         <div v-if="match.team2">
               <div>{{match.team2.name}}</div>
               <div v-for="player in match.team2.players" :key="player">{{ player }}</div>
         </div>
        </div>

    </div>
</template>

<style scoped>

.Match{
   display: flex;
   justify-content: center;
   align-items: center;
}

.gsk-match-team{
   width: 240px;
   padding: 10px;
   height: 115px;
   display: flex;
   flex-direction: column;
   justify-content: center;
}
.gsk-match-placeholder{
   font-size: 16px !important;
   font-style: italic !important;
   font-weight: normal !important;
   margin-bottom: 0px !important;
}
.gsk-match-team:nth-child(1){
   text-align: right;
}
.gsk-match-team div:nth-child(2), .gsk-match-team div:nth-child(3), .gsk-result div{
   font-size: 14px;
   font-style: italic;
   color: rgb(87, 87, 87);
}
.gsk-match-team div:nth-child(1), .gsk-result div:nth-child(1){
   font-size: 18px;
   font-weight: bold;
   color: rgb(56, 56, 56);
   font-style: normal;
   margin-bottom: 5px;
}
.gsk-result{
   text-align: center;
   width: 100px;
   padding: 10px;
   padding-top: 35px;
   height: 115px;
   font-size: 18px;
}
.gsk-button{
   width: 100px;
   font-size: 16px;
   padding: 20px 10px;
   margin: 30px 10px;
}
</style>
