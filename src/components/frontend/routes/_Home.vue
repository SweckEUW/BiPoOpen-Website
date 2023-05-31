<script setup lang="ts">
import ImageGallery from '@/components/frontend/home/ImageGallery.vue';

let headerImg:string = new URL(`/src/assets/2023/poster/poster.jpg`, import.meta.url).href;
</script>

<template>
    <div class="Home">

        <h1>Weck BiPo Open 2023</h1>

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
h1{
    color: var(--main-color);
    font-size: 30px;
    width: 100%;
    text-align: center;
    margin-bottom: 20px;
}

.h-header{
    height: calc(100vh - 200px);
    object-fit: cover;
    margin: auto;
    display: flex;
}

.bp-button{
    display: inline-block;
    width: 100%;
    margin-bottom: 10px;
    padding: 10px;
}

/*MOBILE*/
@media (width <= 900px){
    .h-header{
        height: auto;
        width: 100%;
    }
}
</style>
