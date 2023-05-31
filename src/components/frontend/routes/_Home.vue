<script setup lang="ts">
import ImageGallery from '@/components/frontend/home/ImageGallery.vue';

let headerImg:string = new URL(`/src/assets/2023/poster/poster.jpg`, import.meta.url).href;
</script>

<template>
    <div class="Home">

        <img class="h-header" :src="headerImg" alt="">

        <hr>

        <router-link class="bp-button" to="/Regeln">Zu den Regeln</router-link>
        <router-link class="bp-button" to="/Spielplan">Zum Spielplan</router-link>
        <router-link class="bp-button" to="/Platzierungen">Zu den Gruppenplatzierungen</router-link>
        <router-link class="bp-button" to="/MVP">Zur MVP Tabelle</router-link>

        <hr>

        <ImageGallery/>
    </div>
</template>

<style scoped>
.h-header{
    height: calc(100vh - 200px);
    object-fit: cover;
    margin: auto;
    display: flex;
}

.bp-button{
    display: block;
    width: 50%;
    margin: auto;
    margin-bottom: 10px;
    padding: 10px;
}

hr{
    width: 50%;
    margin: auto;
    margin-top: 20px;
    margin-bottom: 20px;
}

/*MOBILE*/
@media (width <= 900px){
    .h-header{
        height: auto;
        width: 100%;
    }
    .bp-button{
        width: 100%;
    }
}
</style>
