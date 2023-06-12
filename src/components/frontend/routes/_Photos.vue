<script setup lang="ts">
import { ref, onMounted } from "vue"

import ImageModal from '@/components/frontend/photos/ImageModal.vue';
import driveImageIDs from "@/assets/2023/driveImageIDs.json"

const showModal = ref(false);
const modalImageURL = ref("");
const modalImageIndex = ref(0);
const toggleModal = (imageURL?:string, imageIndex?:number) => {
    if(imageURL != undefined)
        modalImageURL.value = imageURL;
    
    if(imageIndex != undefined)
        modalImageIndex.value = imageIndex;

    showModal.value = !showModal.value;
}

let photosHTMLElement:any = ref(null);
const adjustImageGrid = () => {
    let images:any = photosHTMLElement.value.getElementsByTagName("img");
    for (let image of images) {
        image.onload = function() {
            image.parentElement.style.gridRowEnd = this.height > 250 ? "span 2" : "span 1";
            setTimeout(() => { image.style.height = "100%" }, 0);
        }
    }
}

onMounted(() => {
    adjustImageGrid();
});

driveImageIDs.thumbnails.sort((a, b) => a.name.localeCompare(b.name));
driveImageIDs.pictures.sort((a, b) => a.name.localeCompare(b.name));
// driveImageIDs.originals.sort((a, b) => a.name.localeCompare(b.name));

const pictures:any = ref([]); 
for (let i = 0; i < driveImageIDs.pictures.length; i++) {
    let thumbnail:string = "https://drive.google.com/uc?export=view&id=" + driveImageIDs.thumbnails[i].img_id;
    let picture:string = "https://drive.google.com/uc?export=view&id=" + driveImageIDs.pictures[i].img_id;
    // let original:string = "https://drive.google.com/uc?export=view&id=" + driveImageIDs.originals[i].img_id;
    pictures.value.push({
        thumbnail: thumbnail, 
        picture: picture,
        // original: original
    })
}

// const headerVideo = new URL(`@/assets/2023/videos/Zeitraffer.mp4`, import.meta.url).href;

const elementsShown = ref(20);
let pauseScroll = false;
window.onscroll = () => {
    if((window.innerHeight + window.scrollY) >= document.body.scrollHeight && !pauseScroll) {
        elementsShown.value += 20;
        pauseScroll = true;
        setTimeout(() => { adjustImageGrid(); }, 0);
        setTimeout(() => { pauseScroll = false; }, 500);
    }
};
</script>

<template>
    <div class="Photos" ref="photosHTMLElement">

        <h1 class="bp-title">Fotos 2023</h1>

        <Transition name="fade">
            <ImageModal v-show="showModal" :imageURL="modalImageURL" :toggleModal="toggleModal" :pictures="pictures" :index="modalImageIndex"/>
        </Transition>

        <div class="pt-intro">
            Ein großes Dankeschön an 
            <a href="https://www.instagram.com/fingerontrigger" target="_blank">Patrik Finger</a>,
            der am Weck BiPo Open 2023 über 1500 Fotos geschossen hat. 
            <br>
            Folgt ihm gerne auf Instagram 
            <a href="https://www.instagram.com/fingerontrigger" target="_blank">@fingerontrigger </a>  
        </div>
        
        <!-- <div class="pt-video">
            <video :src="headerVideo" autoplay muted loop></video>
        </div> -->

        <div class="pt-gallery">
            <div class="pt-gallery-element" v-for="(element, index) in pictures.slice(0, elementsShown)" :key="element.picture" target="_blank" @click="toggleModal(element.picture, index)">
                <img class="pt-thumbnail" :src="element.thumbnail" alt="" loading="lazy"/>
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

.pt-gallery{
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    grid-gap: 2px;
}
.pt-gallery-element{
    cursor: pointer;
    min-height: 250px;
}
.pt-thumbnail{
    width: 100%;
    object-fit: cover;
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
}
</style>