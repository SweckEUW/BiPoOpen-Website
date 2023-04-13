<script setup lang="ts">
import axios from "axios";

const response = await axios.get("https://bipoopen-backend.vercel.app/");
const data = response.data;
console.log(data);
</script>

<template>
    <h1>Coming Soon</h1>
</template>

<style scoped>
h1{
    margin-top: 200px;
    width: 100%;
    text-align: center;
}
</style>
