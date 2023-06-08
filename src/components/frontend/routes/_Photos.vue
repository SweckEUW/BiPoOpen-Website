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

const pictures:any = ref([]); 
for (let i = 0; i < 50; i++) { //driveImageIDs.pictures.length
    let thumbnail:string = "https://drive.google.com/uc?export=view&id=" + driveImageIDs.thumbnails[i].img_id;
    let picture:string = "https://drive.google.com/uc?export=view&id=" + driveImageIDs.pictures[i].img_id;
    pictures.value.push({
        thumbnail: thumbnail, 
        picture: picture
    })
}
</script>

<template>
    <div class="Photos" ref="photosHTMLElement">

        <h1 class="bp-title">Fotos 2023</h1>

        <Transition name="fade">
            <ImageModal v-if="showModal" :imageURL="modalImageURL" :toggleModal="toggleModal" :pictures="pictures" :index="modalImageIndex"/>
        </Transition>

        <div class="pt-intro">
            Ein großes Dankeschön an 
            <a href="https://www.instagram.com/fingerontrigger" target="_blank">Patrick Finger</a>,
            der am Weck BiPo Open 2023 über 1500 Fotos geschossen hat. 
            <br>
            Folgt ihm gerne auf Instagram 
            <a href="https://www.instagram.com/fingerontrigger" target="_blank">@fingerontrigger </a>  
        </div>

        <div class="pt-gallery">
            <div class="pt-gallery-element" v-for="(element, index) in pictures" :key="element.picture" target="_blank" @click="toggleModal(element.picture, index)">
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

.pt-gallery{
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    grid-gap: 2px;
}
.pt-gallery-element{
    cursor: pointer;
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
}
</style>