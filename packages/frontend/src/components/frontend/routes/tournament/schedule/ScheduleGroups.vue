<script setup lang="ts">
import Sortable from "sortablejs";
import { onMounted, PropType, watch } from "vue"
import { getMatchesGroupPhase, setMatchesGroupPhase } from "@/util/tournamentUtilFunctions.js";
import { convertNumberToCharacter } from "@/util/util.js"; 
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';

import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const props = defineProps({
   getTournament: {type: Function, required: true },
   tournament: {type: Object as PropType<Tournament>, required: true },
   isBackend: {type: Boolean, required: true },
});

const onDragEnd = async (evt:Sortable.SortableEvent) => {

   // Get Index of Group via Group Caption html element
   let groupCaption = (evt.target.parentElement!.getElementsByClassName("rt-caption")[0] as HTMLDivElement).innerText;
   let groupIndex = groupCaption.split(" ")[1].toLowerCase().charCodeAt(0) - 97;

   let matches = props.tournament.groupPhase.matches;
   let matchesInGroup = matches[groupIndex];
   let movedMatch = matchesInGroup.splice(evt.oldIndex!,1);
   matchesInGroup.splice(evt.newIndex!, 0, movedMatch[0]);

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
         let matchesForGroupDOM = document.getElementById("Match-Table-"+i)!.getElementsByClassName("rt-matches")[0] as HTMLDivElement;
         new Sortable(matchesForGroupDOM, {
            animation: 100,
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
      allowTouchMove: !props.isBackend,
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
            <div class="rt-caption">{{ "Gruppe " + convertNumberToCharacter(groupIndex + 1)}}</div>

            <!-- Matches -->
            <div class="rt-matches">
               <MatchElement v-for="(match, matchIndex) in matchesForGroup" :key="match._id" :match="match" :matchIndex="matchIndex" :getTournament="getTournament" :tournament="tournament" :isGroupPhase="true" :isBackend="isBackend"/>
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
#GameScheduleContainer .swiper-pagination, .Standings .swiper-pagination{
   position: sticky;
   padding-top: 10px;
   padding-bottom: 20px;
   display: flex;
   background-color: white;
   top: 216px;
}
#GameScheduleContainer .swiper-pagination-bullet, .Standings .swiper-pagination-bullet{
	padding: 5px 10px; 
	border-radius: 0;
	width: auto;
   height: auto;
	text-align: center;
	color: var(--secondary-color);
   background-color: transparent;
   opacity: 1; 
   margin: 0;
   flex: 1 1 0;
   text-align: center;
}
#GameScheduleContainer .swiper-pagination-bullet-active, .Standings .swiper-pagination-bullet-active{
	color:white;
	background: var(--main-color);
}
.rt-caption{
   margin-bottom: 10px;
   font-size: 28px;
   font-weight: bold;
   color: var(--main-color);
}

/* MOBILE */
@media (width <= 900px){
   #GameScheduleContainer .swiper-pagination{
      top: 172px;
   }
   .rt-caption{
      font-size: 22px;
   }
}
</style>
