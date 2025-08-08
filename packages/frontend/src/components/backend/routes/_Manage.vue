<template>
    <div class="Manage">
        <h1 class="bp-title" style="position: inherit; margin-bottom: 50px;">BiPo Open Backend</h1>
        <router-link class="ma-tournament" :to="'/Manage/OpenGames'">Open Games</router-link>
        <router-link class="ma-tournament" :to="'/Manage/Tournaments'">Tournaments</router-link>
    </div>
</template>

<style scoped>
.Manage{
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.ma-tournament{
    padding: 20px;
    background: white;
    cursor: pointer;
    color: black;
    text-align: center;
    margin-bottom: 50px;
    filter: drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.3));
    text-decoration: none;
    width: 50%;
}
</style>
