<script setup lang="ts">

</script>

<template>
<div class="Loadingscreen">
  <div class="ls-container">
    <div class="loader"></div>
  </div>

</div>
</template>

<style>
.Loadingscreen{
  position: sticky;
  z-index: 999;
}
.ls-container{
  position: absolute;
  left: 0;
  top: 0;
  width: 90vw;
  height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.loader {
  border: 2px solid #f3f3f3; /* Light grey */
  border-top: 2px solid #020202; /* Blue */
  border-radius: 50%;
  width: 100px;
  height: 100px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
