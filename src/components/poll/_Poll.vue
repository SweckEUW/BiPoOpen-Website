<script setup lang="ts">
// import "https://cdn.strawpoll.com/dist/widgets.js"
</script>

<template>
    <div class="strawpoll-embed">
        <iframe title="StrawPoll Embed" id="strawpoll_iframe_PbZqRY9vKyN" scrolling="no" src="https://strawpoll.com/embed/polls/PbZqRY9vKyN" frameborder="0" allowfullscreen allowtransparency>Loading...</iframe>
     </div>
</template>

<style scoped>
.strawpoll-embed{
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
}
iframe{
    height: 670px;
    max-width: 640px; 
    width: 800px;
    border-radius: 10px;
}

/*MOBILE*/
@media (width <= 900px){
	iframe{
        width: 90%;
	}
}
@media (width <= 470px){
	iframe{
        height: 700px;
	}
}
@media (width <= 380px){
	iframe{
        height: 730px;
	}
}
</style>
