<template>
    <div class="pt-[30px] w-full">
        <Accordion>
            <AccordionPanel value="0">
                <AccordionHeader style="color: var(--main-color)">Offene Meilen ({{ offeneMeilen.length }})</AccordionHeader>
                <AccordionContent>
                    <div class="divide-y divide-[#e5e7eb]">
                        <div v-for="(entry, index) in offeneMeilen" :key="index" class="flex flex-col gap-[6px] py-[10px]">
                            <span class="font-semibold" style="color: var(--main-color)">{{ entry.name }}</span>
                            <MatchElement :match="entry.match" showDate />
                        </div>
                        <div v-if="offeneMeilen.length === 0" class="py-[10px] text-[14px] text-[#9ca3af]">Keine offenen Meilen</div>
                    </div>
                </AccordionContent>
            </AccordionPanel>
        </Accordion>

        <Accordion class="mt-[12px]">
            <AccordionPanel value="0">
                <AccordionHeader style="color: var(--main-color)">Absolvierte Meilen ({{ absolvvierteMeilen.length }})</AccordionHeader>
                <AccordionContent>
                    <div class="divide-y divide-[#e5e7eb]">
                        <div v-for="(entry, index) in absolvvierteMeilen" :key="index" class="flex flex-col gap-[6px] py-[10px] opacity-50">
                            <span class="text-[13px] text-[#008000] italic">✓ absolviert am {{ entry.completedAt.toLocaleDateString("de-DE") }}</span>
                            <div class="flex flex-col gap-[6px] line-through">
                                <div class="flex items-center gap-[12px] flex-wrap">
                                    <span class="font-semibold" style="color: var(--main-color)">{{ entry.name }}</span>
                                    <span v-if="!entry.match" class="text-[13px] text-[#6b7280]">{{ getOpenGameDate(entry.time) }}</span>
                                </div>
                                <MatchElement v-if="entry.match" :match="entry.match" showDate />
                                <span v-else class="text-[13px] text-[#6b7280]">Spiel nicht bekannt</span>
                            </div>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionPanel>
        </Accordion>
    </div>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';
import { getNackteMeilen } from './nackteMeilen';

const props = defineProps({
    openGames: { type: Array as PropType<Match[]>, required: true }
});

const nackteMeilen = computed(() => getNackteMeilen(props.openGames));
const offeneMeilen = computed(() => nackteMeilen.value.offen);
const absolvvierteMeilen = computed(() => nackteMeilen.value.absolviert);

let getOpenGameDate = (dateNumber: number) => {
    let date = new Date(dateNumber);
    let time = date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    return date.toLocaleDateString("de-DE") + "  -  " + time + " Uhr";
}
</script>
