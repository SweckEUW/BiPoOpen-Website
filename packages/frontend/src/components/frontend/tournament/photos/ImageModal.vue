<script setup lang="ts">
import { watch, onMounted, PropType } from "vue"

import Swiper from 'swiper';
import { Pagination, Navigation, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

type Picture = {thumbnail: string, picture: string};

const props = defineProps({
    toggleModal: {type: Function, required: true },
    index: {type: Number, required: true },
    pictures: {type: Object as PropType<Picture[]>, required: true }
});

let swiper:Swiper;
onMounted(() => {
    setTimeout(() => {
        var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        swiper = new Swiper('#Gallery',{
            modules: [Pagination, Navigation, Zoom],
            initialSlide: props.index,
            spaceBetween: 50,
            speed: isSafari ? 0 : 500,
            zoom: true,
            pagination: {
                el: ".swiper-pagination",
                type: "fraction",
            },
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            }
        });
    }, 0); 
});

// const downloadImage = async () => {
// }
</script>

<template>
    <div class="ImageModal">

        <div class="pt-icons">
            <!-- <div class="pt-download" @click="downloadImage()">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.22 20.75H5.78C5.43322 20.7359 5.09262 20.6535 4.77771 20.5075C4.4628 20.3616 4.17975 20.155 3.94476 19.8996C3.70977 19.6442 3.52745 19.3449 3.40824 19.019C3.28903 18.693 3.23525 18.3468 3.25 18V15C3.25 14.8011 3.32902 14.6103 3.46967 14.4697C3.61033 14.329 3.80109 14.25 4 14.25C4.19892 14.25 4.38968 14.329 4.53033 14.4697C4.67099 14.6103 4.75 14.8011 4.75 15V18C4.72419 18.2969 4.81365 18.5924 4.99984 18.8251C5.18602 19.0579 5.45465 19.21 5.75 19.25H18.22C18.5154 19.21 18.784 19.0579 18.9702 18.8251C19.1564 18.5924 19.2458 18.2969 19.22 18V15C19.22 14.8011 19.299 14.6103 19.4397 14.4697C19.5803 14.329 19.7711 14.25 19.97 14.25C20.1689 14.25 20.3597 14.329 20.5003 14.4697C20.641 14.6103 20.72 14.8011 20.72 15V18C20.75 18.6954 20.5041 19.3744 20.0359 19.8894C19.5677 20.4045 18.9151 20.7137 18.22 20.75Z" fill="var(--main-color)"/>
                    <path d="M12 15.75C11.9015 15.7504 11.8038 15.7312 11.7128 15.6934C11.6218 15.6557 11.5392 15.6001 11.47 15.53L7.47 11.53C7.33752 11.3878 7.2654 11.1997 7.26882 11.0054C7.27225 10.8111 7.35096 10.6258 7.48838 10.4883C7.62579 10.3509 7.81118 10.2722 8.00548 10.2688C8.19978 10.2654 8.38782 10.3375 8.53 10.47L12 13.94L15.47 10.47C15.6122 10.3375 15.8002 10.2654 15.9945 10.2688C16.1888 10.2722 16.3742 10.3509 16.5116 10.4883C16.649 10.6258 16.7277 10.8111 16.7312 11.0054C16.7346 11.1997 16.6625 11.3878 16.53 11.53L12.53 15.53C12.4608 15.6001 12.3782 15.6557 12.2872 15.6934C12.1962 15.7312 12.0985 15.7504 12 15.75Z" fill="var(--main-color)"/>
                    <path d="M12 15.75C11.8019 15.7474 11.6126 15.6676 11.4725 15.5275C11.3324 15.3874 11.2526 15.1981 11.25 15V4C11.25 3.80109 11.329 3.61032 11.4697 3.46967C11.6103 3.32902 11.8011 3.25 12 3.25C12.1989 3.25 12.3897 3.32902 12.5303 3.46967C12.671 3.61032 12.75 3.80109 12.75 4V15C12.7474 15.1981 12.6676 15.3874 12.5275 15.5275C12.3874 15.6676 12.1981 15.7474 12 15.75Z" fill="var(--main-color)"/>
                </svg>
            </div> -->

            <div class="pt-close" @click="toggleModal()">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M 9.15625 6.3125 L 6.3125 9.15625 L 22.15625 25 L 6.21875 40.96875 L 9.03125 43.78125 L 25 27.84375 L 40.9375 43.78125 L 43.78125 40.9375 L 27.84375 25 L 43.6875 9.15625 L 40.84375 6.3125 L 25 22.15625 Z" fill="var(--main-color)"/></svg>
            </div>
        </div>


        <div class="mo-container">

            <div id="Gallery" class="swiper-container">
                <div class="swiper-wrapper">
                    <div class="swiper-slide" v-for="element in pictures" :key="element.picture">
                        <div class="swiper-zoom-container">
                            <img :src="element.picture" alt="" loading="lazy">
                        </div>
                    </div>
                </div>

                <div class="swiper-button-next" style="right: -15px"></div>
                <div class="swiper-button-prev" style="left: -15px"></div>
                <div class="swiper-pagination"></div>
            </div>

        </div>
    </div>
</template>

<style scoped> 
.ImageModal{
    --swiper-theme-color: var(--main-color);
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.9);
}
.mo-container{
    background: transparent;
    position: absolute;
    width: 95%;
    height: 95%;
    padding: 20px 10px;
}

/* Swiper */
.ImageModal .swiper-container{
    width: 100%;
    height: 100%;
    overflow: visible;
    position: relative;
}
.ImageModal .swiper-pagination{
    color: var(--main-color);
    font-size: 24px;
    left: 0;
    top: 0;
    width: auto;
    height: 50px;
}

.pt-icons{
    position: absolute;
    top: 40px;
    right: 40px;
    cursor: pointer;
    z-index: 2;
    display: flex;
}
.pt-download, .pt-close {
    width: 40px;
    height: 40px;
}
.pt-download {
    margin-right: 15px;
}

/*MOBILE*/
@media (width <= 900px){
    .mo-container{
        width: 95%;
        padding: 20px 10px;
    }
    .pt-icons{
        top: 20px;
        right: 20px;
    }
    .pt-download, .pt-close {
        width: 30px;
        height: 30px;
    }
    .pt-download {
        margin-right: 10px;
    }
    .swiper-pagination{
        top: -20px;
    }
}
</style>
