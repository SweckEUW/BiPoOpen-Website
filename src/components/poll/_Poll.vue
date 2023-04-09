<script setup lang="ts">
// import "https://cdn.strawpoll.com/dist/widgets.js"
</script>

<template>
    <div class="strawpoll-embed">
        <iframe title="StrawPoll Embed" id="strawpoll_iframe_PbZqRY9vKyN" src="https://strawpoll.com/embed/polls/PbZqRY9vKyN" frameborder="0" allowfullscreen allowtransparency>Loading...</iframe>
     </div>
</template>

<style scoped>
.strawpoll-embed{
    display: flex;
    justify-content: center;
    margin-top: 80px;
    margin-bottom: 50px;
    height: calc(100vh - 80px - 50px);
}
iframe{
    height: 100%;
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
</style>
