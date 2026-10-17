<template>
    <div class="LeagueWheel">
        <div class="lw-wheel" :class="{ 'lw-wheel-disabled': !canSpin }">
            <svg class="lw-rotor" :class="{ 'lw-rotor-has-winner': !!winnerName }" viewBox="0 0 500 500" :style="rotorStyle" @click="spin()">
                <g v-for="segment in segments" :key="segment.entry.name" class="lw-segment" :class="{ 'lw-segment-winner': segment.entry.name === winnerName }">
                    <circle v-if="segments.length === 1" :cx="CENTER" :cy="CENTER" :r="RADIUS" :fill="segment.color.fill" />
                    <path v-else :d="segment.path" :fill="segment.color.fill" />

                    <!-- Inhalt liegt auf der Segmentmitte, am Zeiger steht er dadurch aufrecht -->
                    <g :transform="`rotate(${segment.midAngle} ${CENTER} ${CENTER})`">
                        <image
                            :href="segment.entry.logo"
                            :x="CENTER + RADIUS - RIM_GAP - layout.logoSize"
                            :y="CENTER - layout.logoSize / 2"
                            :width="layout.logoSize"
                            :height="layout.logoSize"
                            preserveAspectRatio="xMidYMid meet"
                        />
                        <text
                            :x="layout.textEnd"
                            :y="CENTER"
                            dy="0.35em"
                            text-anchor="end"
                            :font-size="segment.fontSize"
                            :textLength="segment.textLength"
                            :lengthAdjust="segment.textLength ? 'spacingAndGlyphs' : undefined"
                            :fill="segment.color.text"
                        >{{ segment.entry.name }}</text>
                    </g>
                </g>
                <circle class="lw-rim" :cx="CENTER" :cy="CENTER" :r="RADIUS" fill="none" />
            </svg>

            <div class="lw-center" @click="spin()">
                <img :src="BipoLeagueLogo" alt="BiPo League" />
            </div>
            <div class="lw-pointer"></div>
        </div>

        <div class="bp-button lw-spin-button" :class="{ 'lw-spin-button-disabled': !canSpin }" @click="spin()">
            {{ isSpinning ? 'Dreht...' : 'Drehen' }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, PropType, ref, watch } from 'vue';
const BipoLeagueLogo = new URL(`/src/assets/league/BiPo-League-Logo.webp`, import.meta.url).href;

const props = defineProps({
    entries: { type: Array as PropType<LeaguePlayer[]>, required: true },
    disabled: { type: Boolean, default: false }
});

const emit = defineEmits<{
    (e: 'spin-start'): void;
    (e: 'spun', entry: LeaguePlayer): void;
}>();

// Masse im viewBox (500 x 500)
const CENTER = 250;
const RADIUS = 240;
const RIM_GAP = 8;          // Abstand Logo zum Rand
const HUB_RADIUS = 35;      // Mittelscheibe (14 % der Breite)
const TEXT_GAP = 6;
const MAX_LOGO_SIZE = 50;
const MAX_FONT_SIZE = 20;
const MIN_FONT_SIZE = 11;
const CHAR_WIDTH = 0.6;     // geschaetzte Zeichenbreite in em (Arial Bold)

const SPIN_DURATION = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1500 : 5000;

// Markenfarben im Wechsel, Textfarbe jeweils mit genug Kontrast
const COLORS = [
    { fill: '#EA5160', text: '#FFFFFF' },
    { fill: '#61C3D9', text: '#12343C' },
    { fill: '#F7B32B', text: '#3D2A00' },
    { fill: '#2E8B7A', text: '#FFFFFF' },
];

const rotation = ref(0);
const isSpinning = ref(false);
const winnerName = ref<string | null>(null);
let spinTimeout: ReturnType<typeof setTimeout> | undefined;

const canSpin = computed(() => !props.disabled && !isSpinning.value && props.entries.length > 0);

const rotorStyle = computed(() => ({
    transform: `rotate(${rotation.value}deg)`,
    transition: `transform ${SPIN_DURATION}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
}));

const layout = computed(() => {
    const count = props.entries.length;
    const segmentAngle = 360 / Math.max(count, 1);
    const halfAngleSin = count > 1 ? Math.sin((segmentAngle / 2) * Math.PI / 180) : 1;

    const logoSize = Math.min(MAX_LOGO_SIZE, 2 * (RADIUS - RIM_GAP - MAX_LOGO_SIZE / 2) * halfAngleSin * 0.8);
    const textStart = CENTER + HUB_RADIUS + TEXT_GAP;
    const textEnd = CENTER + RADIUS - RIM_GAP - logoSize - TEXT_GAP;
    const textMidRadius = (textStart + textEnd) / 2 - CENTER;
    const maxFontSize = Math.min(MAX_FONT_SIZE, 2 * textMidRadius * halfAngleSin * 0.75);

    return { segmentAngle, logoSize, textEnd, textLength: textEnd - textStart, maxFontSize };
});

const pointOnCircle = (angle: number) => {
    const radians = angle * Math.PI / 180;
    return `${CENTER + RADIUS * Math.cos(radians)} ${CENTER + RADIUS * Math.sin(radians)}`;
}

const getColor = (index: number, count: number) => {
    // Letztes Segment darf nicht dieselbe Farbe wie das erste haben
    if (count > 1 && index === count - 1 && index % COLORS.length === 0)
        return COLORS[2];
    return COLORS[index % COLORS.length];
}

const segments = computed(() => {
    const { segmentAngle, textLength, maxFontSize } = layout.value;
    const count = props.entries.length;

    return props.entries.map((entry, index) => {
        const startAngle = index * segmentAngle;
        const endAngle = startAngle + segmentAngle;
        const largeArc = segmentAngle > 180 ? 1 : 0;

        // Lange Namen kleiner, notfalls auf die verfuegbare Laenge stauchen
        const fontSize = Math.max(MIN_FONT_SIZE, Math.min(maxFontSize, textLength / (entry.name.length * CHAR_WIDTH)));
        const estimatedWidth = entry.name.length * fontSize * CHAR_WIDTH;

        return {
            entry,
            color: getColor(index, count),
            midAngle: startAngle + segmentAngle / 2,
            path: `M ${CENTER} ${CENTER} L ${pointOnCircle(startAngle)} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${pointOnCircle(endAngle)} Z`,
            fontSize,
            textLength: estimatedWidth > textLength ? textLength : undefined
        };
    });
});

// Neue Eintraege (naechste Phase) -> Hervorhebung zuruecksetzen
watch(() => props.entries.map(entry => entry.name).join('|'), () => {
    winnerName.value = null;
});

const spin = () => {
    if (!canSpin.value) return;

    const entries = props.entries;
    const winnerIndex = Math.floor(Math.random() * entries.length);
    const winner = entries[winnerIndex];

    // Zufaelliger Punkt im Gewinnersegment soll am Ende unter dem Zeiger (rechts, 0 Grad) stehen
    const segmentAngle = 360 / entries.length;
    const targetAngle = (winnerIndex + 0.1 + Math.random() * 0.8) * segmentAngle;
    const currentAngle = ((rotation.value % 360) + 360) % 360;
    const offset = (((360 - targetAngle - currentAngle) % 360) + 360) % 360;
    const fullTurns = 5 + Math.floor(Math.random() * 3);

    winnerName.value = null;
    isSpinning.value = true;
    emit('spin-start');
    rotation.value += fullTurns * 360 + offset;

    spinTimeout = setTimeout(() => {
        isSpinning.value = false;
        winnerName.value = winner.name;
        emit('spun', winner);
    }, SPIN_DURATION);
}

onBeforeUnmount(() => clearTimeout(spinTimeout));
</script>

<style scoped>
.LeagueWheel{
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.lw-wheel{
    position: relative;
    width: min(100%, 520px);
    aspect-ratio: 1;
}
.lw-wheel::before{
    content: '';
    position: absolute;
    inset: 2%;
    border-radius: 50%;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
}

.lw-rotor{
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    cursor: pointer;
    will-change: transform;
}
.lw-wheel-disabled .lw-rotor,
.lw-wheel-disabled .lw-center{
    cursor: default;
}

.lw-segment{
    transition: opacity 0.3s ease;
}
.lw-segment path{
    stroke: white;
    stroke-width: 1.5;
}
.lw-segment text{
    font-family: Helvetica, Arial, sans-serif;
    font-weight: 700;
}
.lw-segment text,
.lw-segment image{
    pointer-events: none;
}
.lw-rotor-has-winner .lw-segment:not(.lw-segment-winner){
    opacity: 0.35;
}
.lw-rim{
    stroke: white;
    stroke-width: 6;
}

.lw-center{
    position: absolute;
    top: 50%;
    left: 50%;
    width: 14%;
    height: 14%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}
.lw-center img{
    width: 75%;
    height: 75%;
    object-fit: contain;
}

/* Zeiger rechts wie bei wheelofnames */
.lw-pointer{
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 14px solid transparent;
    border-bottom: 14px solid transparent;
    border-right: 30px solid #333333;
    filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.35));
}

.lw-spin-button{
    width: min(100%, 520px);
    margin: 15px 0 0;
}
.lw-spin-button-disabled{
    opacity: 0.3;
    pointer-events: none;
}
</style>
