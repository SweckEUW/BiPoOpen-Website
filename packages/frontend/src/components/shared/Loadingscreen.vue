<template>
<div class="Loadingscreen">
  <div class="ls-container">
    <div class="loader"></div>
  </div>
</div>
</template>

<style scoped>
.Loadingscreen{
  position: sticky;
  z-index: 999;
}
.ls-container{
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.loader {
  border: 2px solid #f3f3f3; 
  border-top: 2px solid var(--main-color);
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
