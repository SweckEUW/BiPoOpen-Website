<script setup lang="ts">
import { onMounted } from "vue"

import Swiper , { Pagination, Navigation } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const getImage = (number:number) => {	
    return new URL(`/src/assets/2022/pictures/${number}.jpeg`, import.meta.url).href;
}

onMounted(() => {
    setTimeout(() => {
        new Swiper('#mySwiper',{
            modules: [Pagination, Navigation],
            spaceBetween: 100,
            autoplay: {
                delay: 500,
                disableOnInteraction: false,
            },
            direction: 'horizontal',
            mousewheel: true,
            loop: true,
            observer: true,
            pagination: {
                el: '#swiper-pagination',
                clickable: true,
            },
        });
    }, 0); 
});
</script>

<template>
    <div class="ImageGallery">

        <div class="ig-title">Impressionen aus 2022</div>

        <div id="mySwiper" class="swiper mp-gallery">
            <div class="swiper-wrapper">
                <div class="swiper-slide" v-for="i in 11" :key="i">
                    <img :src="getImage(i)" alt="">
                </div>
            </div>

            <div id="swiper-pagination"/>
        </div>

    </div>
</template>

<style>
.ImageGallery{
    margin-top: 50px;
}
.ig-title{
    width: 100%;
    text-align: center;
    font-size: 22px;
}
.ImageGallery img{
	height: 300px;
    width: 100%;
	user-select: none;
	object-fit: contain;
}
#swiper-pagination{
    text-align: center;
}
.swiper-pagination-bullet{
    background: var(--main-color);
    width: 12px;
    height: 12px;
}
</style>
