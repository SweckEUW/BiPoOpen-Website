<script setup lang="ts">
import { onMounted } from "vue"

import Swiper , { Pagination, Navigation, Autoplay } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const getImage = (number:number) => {	
    return new URL(`/src/assets/2022/pictures/${number}.jpeg`, import.meta.url).href;
}

onMounted(() => {
    setTimeout(() => {
        new Swiper('#SwiperGallery',{
            modules: [Pagination, Navigation, Autoplay],
            spaceBetween: 100,
            speed: 1000,
            direction: 'horizontal',
            mousewheel: {
			    invert: true,
		    },
            loop: true,
            observer: true,
            pagination: {
                el: '#SwiperPaginationGallery',
                clickable: true,
            },
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
            },
        });
    }, 0); 
});
</script>

<template>
    <div class="ImageGallery">

        <div class="ig-title">Impressionen aus 2022</div>

        <div id="SwiperGallery" class="swiper mp-gallery">
            <div class="swiper-wrapper">
                <div class="swiper-slide" v-for="i in 11" :key="i">
                    <img :src="getImage(i)" alt="">
                </div>
            </div>

            <div id="SwiperPaginationGallery"/>
        </div>

    </div>
</template>

<style>
.ig-title{
    width: 100%;
    text-align: center;
    color: var(--main-color);
    font-size: 30px;
    margin-bottom: 20px;
}
.ImageGallery img{
	height: 800px;
    width: 100%;
	user-select: none;
	object-fit: contain;
}
#SwiperPaginationGallery{
    text-align: center;
}
.swiper-pagination-bullet{
    background: var(--main-color);
    width: 12px;
    height: 12px;
}

/*MOBILE*/
@media (width <= 900px){
    .ImageGallery img{
        height: 300px;
    }
}
</style>