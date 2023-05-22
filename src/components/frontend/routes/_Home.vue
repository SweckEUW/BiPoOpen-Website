<script setup lang="ts">
let headerImg:string = new URL(`/src/assets/2023/poster/poster.jpg`, import.meta.url).href;
</script>

<template>
    <div class="Home">
        <img class="h-header" :src="headerImg" alt="">
        <div class="bp-button">
            <router-link to="/Spielplan">Spielplan</router-link>
        </div>

        <div class="bp-button">
            <router-link to="/Platzierungen">Platzierungen</router-link>
        </div>

        <div class="bp-button">
            <router-link to="/MVP">Most Valuable Player</router-link>
        </div>
    </div>
</template>

<style scoped>
.h-header{
    height: calc(100vh - 200px);
    object-fit: cover;
}
.bp-button{
    margin-bottom: 0px;
    margin-top: 10px;
}
.bp-button a{
    color: white;
}
</style>
