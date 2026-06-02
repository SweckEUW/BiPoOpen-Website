<template>
    <div class="pt-[30px] w-full">
        <Accordion>
            <AccordionPanel value="0">
                <AccordionHeader style="color: var(--main-color)">Offene Meilen ({{ offeneMeilen.length }})</AccordionHeader>
                <AccordionContent>
                    <div class="divide-y divide-[#e5e7eb]">
                        <div v-for="(entry, index) in offeneMeilen" :key="index" class="flex flex-col gap-[6px] py-[10px]">
                            <div class="flex items-center gap-[12px] flex-wrap">
                                <span class="font-semibold" style="color: var(--main-color)">{{ entry.name }}</span>
                                <span class="text-[13px] text-[#6b7280]">{{ getOpenGameDate(entry.time) }}</span>
                            </div>
                            <MatchElement :match="entry.match" />
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
                                    <span class="text-[13px] text-[#6b7280]">{{ getOpenGameDate(entry.time) }}</span>
                                </div>
                                <MatchElement v-if="entry.match" :match="entry.match" />
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

const props = defineProps({
    openGames: { type: Array as PropType<Match[]>, required: true }
});

// Martin Brandt – completedAt: Datum wann die nackte Meile absolviert wurde
let removedMatched = [
    { id: "68aa17a002608bee9cc83c3a", completedAt: new Date(2025, 7, 23) }, // Martin Brandt
    { id: "6a19c18adb067206212a65d0", completedAt: new Date(2026, 4, 29) }, // Jonas Weck
    { id: "6779b105c8962cfa56f74847", completedAt: new Date(2026, 4, 29) }, // Giulia Sanio
    { id: "694721edb49c327da2268200", completedAt: new Date(2026, 4, 29) }, // Leon Rose 
];

// Einträge ohne bekanntes Spiel – name und completedAt manuell eintragen
const manualAbsolviert: { name: string; completedAt: Date }[] = [
    { name: "Simon Weck", completedAt: new Date(2026, 4, 31) },  // TODO: richtiges Datum eintragen
    { name: "Simon Weck", completedAt: new Date(2026, 4, 21) },  // TODO: richtiges Datum eintragen
];

const allPlayersWith0Hits = computed(() => {
    const players: (Player & { time: number; match: Match })[] = [];

    props.openGames.forEach(match => {
        match.team1.players.forEach(player => {
            if(player.score == 0) players.push({...player, time: match.time!, match});
        });
        match.team2.players.forEach(player => {
            if(player.score == 0) players.push({...player, time: match.time!, match});
        });
    });

    return players;
});

const offeneMeilen = computed(() =>
    allPlayersWith0Hits.value.filter(p => !removedMatched.some(m => m.id === p.match._id))
);



const absolvvierteMeilen = computed(() => {
    const fromMatches = allPlayersWith0Hits.value
        .filter(p => removedMatched.some(m => m.id === p.match._id))
        .map(p => ({ ...p, match: p.match as Match | null, completedAt: removedMatched.find(m => m.id === p.match._id)!.completedAt }));

    const manual = manualAbsolviert.map(e => ({ name: e.name, time: 0, match: null as Match | null, completedAt: e.completedAt }));

    return [...fromMatches, ...manual].sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
});

let getOpenGameDate = (dateNumber: number) => {
    let date = new Date(dateNumber);
    let time = date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    return date.toLocaleDateString("de-DE") + "  -  " + time + " Uhr";
}
</script>
