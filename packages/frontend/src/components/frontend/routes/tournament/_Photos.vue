<script setup lang="ts">
import { ref, onMounted } from "vue"

import ImageModal from '@/components/frontend/photos/ImageModal.vue';
import tournaments from '@/assets/tournaments.json';

import { useRoute } from "vue-router";
const route = useRoute();


let tournamentData = tournaments.find((tournament) => tournament.name == route.params.id)!;
let posterURL = new URL(`/src/assets/${tournamentData.fotos!.poster}`, import.meta.url).href;

onMounted(async () => {
    await setupImages();
    adjustImageGrid();
});

let pictures:any = ref([]);
const setupImages = async () => {

    // Get IDs of images ind drive via json file
    let driveImageIDsURL = new URL(`/src/assets/${tournamentData.fotos!.driveImageIDs}`, import.meta.url);
    let driveImageIDs:any = await fetch(driveImageIDsURL);
    driveImageIDs = await driveImageIDs.json();

    // Sort array
    driveImageIDs.sort((a:any, b:any) => a.name.localeCompare(b.name));
    
    // create array with urls to images via drive ids. set thumbnail parameter in url to reduce image size for fast loading
    for (let i = 0; i < driveImageIDs.length; i++) {
        let thumbnail = "https://drive.google.com/thumbnail?&id=" + driveImageIDs[i].img_id + "&sz=w500";
        let picture = "https://drive.google.com/thumbnail?&id=" + driveImageIDs[i].img_id + "&sz=w1000";
        
        if(driveImageIDs[i].img_id == "1W5chqvZUks8OSy2e3_pxTv1uWFBJZ8WV")
            thumbnail = "https://drive.google.com/thumbnail?&id=" + driveImageIDs[i].img_id + "&sz=w1000";
        
        // let thumbnail = "https://www.robin-noorda.com/uploads/1/6/8/3/16830688/3347022_orig.jpg";
        // let picture = "https://www.robin-noorda.com/uploads/1/6/8/3/16830688/3347022_orig.jpg";
        // if(i%2 == 0){
        //     thumbnail = "https://img.freepik.com/free-photo/people-taking-selfie-together-registration-day_23-2149096795.jpg";
        //     picture = "https://img.freepik.com/free-photo/people-taking-selfie-together-registration-day_23-2149096795.jpg";
        // }
        // if(i%3 == 0){
        //     thumbnail = "https://images.pexels.com/photos/1459505/pexels-photo-1459505.jpeg?cs=srgb&dl=pexels-felixmittermeier-1459505.jpg&fm=jpg";
        //     picture = "https://images.pexels.com/photos/1459505/pexels-photo-1459505.jpeg?cs=srgb&dl=pexels-felixmittermeier-1459505.jpg&fm=jpg";
        // }

        pictures.value.push({
            thumbnail: thumbnail, 
            picture: picture,
        })
    }
}

const showModal = ref(false);
const modalImageIndex = ref(0);
const toggleModal = (imageIndex?:number) => {
    if(imageIndex != undefined)
        modalImageIndex.value = imageIndex;

    showModal.value = !showModal.value;
}

let photosHTMLElement:any = ref(null);
const adjustImageGrid = () => {
    let images = photosHTMLElement.value.getElementsByTagName("img");

    for (let image of images) {
        image.onload = function() {
            image.parentElement.style.gridRowEnd = this.naturalHeight > 500 ? "span 3" :  this.naturalHeight > 350 ? "span 2" : "span 1";
            image.parentElement.style.gridColumnEnd = this.naturalWidth > 900 ? "span 3" : "span 1";
        }
    }
}

const elementsShown = ref(20);
let pauseScroll = false;
window.onscroll = () => {
    if((window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 1000) && !pauseScroll) {
        elementsShown.value += 20;
        pauseScroll = true;
        setTimeout(() => { adjustImageGrid(); }, 0);
        setTimeout(() => { pauseScroll = false; }, 500);
    }
};
</script>

<template>
    <div class="Photos">

        <h1 class="bp-title">{{"Fotos " + route.params.id }}</h1>

        <Transition name="fade">
            <ImageModal v-show="showModal" :toggleModal="toggleModal" :pictures="pictures" :index="modalImageIndex"/>
        </Transition>

        
        <!-- 2023 -->
        <div v-if="route.params.id == '2023'">
            <div class="pt-intro">
                Ein großes Dankeschön an 
                <a href="https://www.instagram.com/fingerontrigger" target="_blank">Patrik Finger</a>,
                der am Weck BiPo Open 2023 über 1500 Fotos geschossen hat. 
                <br>
                Folgt ihm gerne auf Instagram 
                <a href="https://www.instagram.com/fingerontrigger" target="_blank">@fingerontrigger </a>  
            </div>
        </div>  

        <!-- 2024 -->
        <div v-if="route.params.id == '2024'">
            <div class="pt-intro">
                Ein großes Dankeschön an 
                <a href="https://www.instagram.com/fingerontrigger" target="_blank">Patrik Finger</a>,
                der am Weck BiPo Open 2024 wieder als Fotograf tätig war. 
                <br>
                Folgt ihm gerne auf Instagram 
                <a href="https://www.instagram.com/fingerontrigger" target="_blank">@fingerontrigger </a>  
            </div>
        </div>  

        <!-- Poster -->
        <div class="pt-poster">
            <img :src="posterURL">
        </div>

        <!-- Image Grid -->
        <div class="pt-gallery" ref="photosHTMLElement">
            <div class="pt-gallery-element" v-for="(element, index) in pictures.slice(0, elementsShown)" :key="element.picture" target="_blank" @click="toggleModal(index)">
                <img class="pt-thumbnail" :src="element.thumbnail" loading="lazy"/>
            </div>
        </div>

    </div>
</template>

<style>
.pt-intro{
    text-align: center;
    font-size: 18px;
    margin-bottom: 40px;
}
.Photos a{
    color: var(--main-color);
    text-decoration-color: var(--main-color);
}
.Photos a:hover{
    color: var(--secondary-color);
    text-decoration-color: var(--secondary-color);
}

.pt-video{
    width: 100%;
    display: flex;
    justify-content: center;
}
.pt-video video{
    width: 70%;
    margin-bottom: 40px;
}

.pt-poster{
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: 20px;
}
.pt-poster img{
    width: 25%;
    object-fit: cover;
}

.pt-gallery{
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    grid-gap: 2px;
}
.pt-gallery-element{
    display: flex;
    cursor: pointer;
    min-height: 250px;
}
.pt-thumbnail{
    object-fit: cover;
    width: 100%;
    height: 100%;
}

/*MOBILE*/
@media (width <= 900px){
    .pt-intro{
        font-size: 16px;
    }
    .pt-gallery{
        grid-template-columns: auto auto auto;
    }
    .Photos video{
        width: 100%;
        margin-bottom: 20px;
    }
    .pt-gallery-element{
        min-height: 110px;
    }
    .pt-poster img{
        width: 60%;
    }
}
</style>