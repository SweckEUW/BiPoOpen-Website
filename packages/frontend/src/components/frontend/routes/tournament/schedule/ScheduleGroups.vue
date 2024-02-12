<script setup lang="ts">
import Sortable from "sortablejs";
import { onMounted, watch } from "vue"
import { getMatchesGroupPhase, setMatchesGroupPhase } from "@/util/tournamentUtilFunctions.js";
import { convertNumberToCharacter } from "@/util/util.js"; 
import Swiper, { Pagination } from 'swiper';
import 'swiper/swiper-bundle.min.css';
import MatchElement from '@/components/shared/MatchElement.vue';

const props = defineProps(['getTournament','tournament','isBackend'])

const onDragEnd = async (evt:any) => {
   let groupCaption = evt.srcElement.parentElement.parentElement.getElementsByClassName("rt-caption")[0].getElementsByTagName("div")[0].innerText;
   let groupIndex = groupCaption.split(" ")[1].toLowerCase().charCodeAt(0) - 97;
   
   let matches = props.tournament.groupPhase.matches;
   let matchesInGroup = matches[groupIndex];
   let movedMatch = matchesInGroup.splice(evt.oldIndex,1);
   matchesInGroup.splice(evt.newIndex, 0, movedMatch[0]);

   let success:boolean = await setMatchesGroupPhase(props.tournament._id, matches);
   if(success){
      await props.getTournament();
      initSortable();
   }
}

const initSortable = () => {
   setTimeout(() => { 
      let groupAmmount:number = props.tournament.settings.fixedGroupAmmount;
      for (let i = 0; i < groupAmmount; i++){
         let matchesForGroupDOM:any = document.getElementById("Match-Table-"+i)?.getElementsByClassName("rt-matches")[0];
         new Sortable(matchesForGroupDOM, {
            animation: 150,
            group: "_" + i ,
            onEnd: onDragEnd,
            filter: '.Modal',
            preventOnFilter: false,
            handle: ".mt-handle"
         });
      }
   }, 0);
}

watch(() => props.tournament, () => {
   if(props.tournament.groupPhase.groups && props.isBackend)
      initSortable();
});

onMounted(() => {
   if(props.tournament && props.tournament.groupPhase.groups && props.isBackend)
      initSortable();

   new Swiper('#GameScheduleGroupsSwiper',{
      modules: [Pagination],
      initialSlide: 0,
      spaceBetween: 50,
      speed: 500,
      pagination: {
         el: "#GameScheduleGroupsSwiper-Pagination",
         clickable: true,
         renderBullet: (index, className) => {
            return '<span class="' + className + '">' + convertNumberToCharacter(index+1) + '</span>';
         }
      }
   });
});
</script>

<template>
   <div class="swiper-pagination" id="GameScheduleGroupsSwiper-Pagination"/>

   <div class="GameScheduleGroups swiper-container" id="GameScheduleGroupsSwiper">
      <div class="swiper-wrapper">

         <div class="rt-table swiper-slide" v-for="(matchesForGroup ,groupIndex) in getMatchesGroupPhase(tournament)" :key="groupIndex" :id="'Match-Table-'+groupIndex">

            <!-- Caption -->
            <div class="rt-caption">
               <div>{{ "Gruppe " + convertNumberToCharacter(groupIndex + 1)}}</div>
               <div>{{ "Tisch " + (groupIndex + 1) }}</div>
            </div>

            <div class="rt-rows">

               <!-- First Row -->
               <div class="rt-row1">
                  <div :style="{'marginLeft': isBackend ? '25px' : ''}">#</div>
                  <div>Team 1</div>
                  <div></div>
                  <div>Team 2</div>
               </div>

               <!-- Matches -->
               <div class="rt-matches">
                  <div class="rt-match" v-for="(match, matchIndex) in matchesForGroup" :key="match">
                     <hr style="margin: 2px 0px">
                     <MatchElement :match="match" :matchIndex="matchIndex" :getTournament="getTournament" :tournament="tournament" :isGroupPhase="true" :isBackend="isBackend"/>
                  </div>
               </div>

            </div>
         </div>

      </div>
   </div>
</template>

<style>
.GameScheduleGroups{
   overflow: hidden;
}

/* Top Swiper Pagination */
.swiper-pagination{
   position: sticky !important;
   top: 180px !important;
   padding-top: 10px !important;
   padding-bottom: 20px !important;
   display: flex !important;
   background-color: white !important;
}
.swiper-pagination-bullet {
	padding: 5px 10px !important; 
	border-radius: 0 !important;
	width: auto !important;
   height: auto !important;
	text-align: center !important;
	color: var(--secondary-color) !important;
   background-color: transparent !important;
   opacity: 1 !important; 
   margin: 0 !important;
   flex: 1 1 0 !important;
   text-align: center !important;
}
.swiper-pagination-bullet-active {
	color:white !important;
	background: var(--main-color) !important;
}


.rt-caption{
   margin-bottom: 10px;
}
.rt-caption div:nth-child(1){
   font-size: 28px;
   font-weight: bold;
   color: var(--main-color);
}
.rt-caption div:nth-child(2){
   font-size: 20px;
   color: var(--main-color);
   opacity: 0.7;
}
.rt-rows{
   display: flex;
   flex-direction: column;
   align-items: center;
}
.rt-row1{
   display: flex;
   width: 100%;
   text-align: center;
   font-weight: bold;
   font-size: 20px;
   margin-bottom: 5px;
}
.rt-row1 div:nth-child(1){
   width: 40px; /* same width as .mt-index from MatchElement.vue */
}
.rt-row1 div:nth-child(2){
   text-align: right;
   color: var(--main-color);
}
.rt-row1 div:nth-child(2), .rt-row1 div:nth-child(4){
   flex-grow: 1;
   font-size: 24px;
}
.rt-row1 div:nth-child(3){
   width: 110px; /* same width as .mt-result from MatchElement.vue */
}
.rt-row1 div:nth-child(4){
   text-align: left;
   color: var(--secondary-color);
}
.rt-matches{
   width: 100%;
}

/*MOBILE*/
@media (width <= 900px){
   .rt-row1{
      font-size: 16px;
   }
   .rt-row1 div:nth-child(1){
      display: none;
   }
   .rt-row1 div:nth-child(3){
      width: 60px;
   }
}
</style>
