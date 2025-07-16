<script setup lang="ts">
import { ref, onMounted, PropType } from "vue"
import ImageModal from '@/components/frontend/tournament/photos/ImageModal.vue';

const props = defineProps({
   tournamentPhotos: {type: Object as PropType<any>, required: true }
});

let posterURL = new URL(`/src/assets/${props.tournamentPhotos.poster}`, import.meta.url).href;

onMounted(async () => {
    await setupImages();
    adjustImageGrid();
});

let pictures:any = ref([]);
const setupImages = async () => {

    // Get IDs of images ind drive via json file
    let driveImageIDsURL = new URL(`/src/assets/${props.tournamentPhotos.driveImageIDs}`, import.meta.url);
    let driveImageIDs:any = await fetch(driveImageIDsURL);
    driveImageIDs = await driveImageIDs.json();

    // Sort array
    driveImageIDs.sort((a:any, b:any) => a.name.localeCompare(b.name));
    
    // create array with urls to images via drive ids. set thumbnail parameter in url to reduce image size for fast loading
    for (let i = 0; i < driveImageIDs.length; i++) {
        let thumbnail = "https://drive.google.com/thumbnail?&id=" + driveImageIDs[i].img_id + "&sz=w500";
        let picture = "https://drive.google.com/thumbnail?&id=" + driveImageIDs[i].img_id + "&sz=w1000"; //TODO-Minor: dont use thumnail insead use image in full quality from drive
        
        if(driveImageIDs[i].img_id == "1W5chqvZUks8OSy2e3_pxTv1uWFBJZ8WV"){ // Edge case for panorama image 2024
            thumbnail = "https://drive.google.com/thumbnail?&id=" + driveImageIDs[i].img_id + "&sz=w1000";
            picture = "https://drive.google.com/thumbnail?&id=" + driveImageIDs[i].img_id + "&sz=w1500";
        }
        
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

        <Transition name="fade">
            <ImageModal v-if="showModal" :toggleModal="toggleModal" :pictures="pictures" :index="modalImageIndex"/>
        </Transition>

        <!-- 2023 -->
        <div v-if="tournamentPhotos.text">
            <div class="pt-intro" v-html="tournamentPhotos.text"/>
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

<style scoped>
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