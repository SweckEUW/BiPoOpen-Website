<script setup lang="ts">
let headerImg:string = new URL(`/src/assets/header.jpeg`, import.meta.url).href;
</script>

<template>
    <div class="Home">
        <img class="h-header" :src="headerImg" alt="">
    </div>
</template>

<style scoped>
.h-header{
    width: 100%;
    height: 50vh;
    object-fit: cover;
}
</style>
