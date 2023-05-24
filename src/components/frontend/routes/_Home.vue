<script setup lang="ts">
let headerImg:string = new URL(`/src/assets/2023/poster/poster.jpg`, import.meta.url).href;
</script>

<template>
    <div class="Home">
        <img class="h-header" :src="headerImg" alt="">
    </div>
</template>

<style scoped>
.h-header{
    height: calc(100vh - 200px);
    object-fit: cover;
    margin: auto;
    display: flex;
}

/*MOBILE*/
@media (width <= 900px){
    .h-header{
        height: auto;
        width: 100%;
    }
}
</style>
