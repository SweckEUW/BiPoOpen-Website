import { computed, onBeforeUnmount, ref } from 'vue';

const MOBILE_QUERY = '(width <= 900px)';

// Gleicher Breakpoint wie die CSS-Media-Queries (Viewport-Breite).
export function useIsMobile() {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const isMobile = ref(mediaQuery.matches);

    const update = (event: MediaQueryListEvent) => isMobile.value = event.matches;
    mediaQuery.addEventListener('change', update);
    onBeforeUnmount(() => mediaQuery.removeEventListener('change', update));

    return isMobile;
}

// Spaltenbezeichnungen aller Tabellen: [Desktop, Mobil].
const TABLE_LABELS = {
    rank: ['Platz', '#'],
    games: ['Spiele', 'SP'],
    wins: ['Siege', 'S'],
    losses: ['Niederlagen', 'N'],
    diff: ['Trefferverhältnis', 'DIFF'],
    hitRate: ['Trefferquote', 'Ø'],
    hits: ['Treffer', 'TRF'],
    winRate: ['Siegwahrscheinlichkeit', 'S%'],
} as const;

type TableLabel = keyof typeof TABLE_LABELS;

export function useTableLabels() {
    const isMobile = useIsMobile();

    return computed(() => {
        const index = isMobile.value ? 1 : 0;
        return Object.fromEntries(
            Object.entries(TABLE_LABELS).map(([key, labels]) => [key, labels[index]])
        ) as Record<TableLabel, string>;
    });
}

// Hintergruende fuer Platz 1-3. Literale Strings, damit Tailwind sie beim Scannen findet.
export const PODIUM_ROW_CLASSES = ['!bg-[var(--secondary-color-weak)]', '!bg-[#e6faff]', '!bg-[#f4fdff]'];
