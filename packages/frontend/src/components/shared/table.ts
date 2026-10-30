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
    games: ['Spiele', 'SP'],
    wins: ['Siege', 'S'],
    losses: ['Niederlagen', 'N'],
    diff: ['Differenz', 'Diff'],
    hitRate: ['Trefferquote', 'Ø Treffer'],
    hits: ['Treffer', 'Treffer'],
    winRate: ['Siegquote', 'Sieg %'],
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

// Differenz mit Vorzeichen und Farbklasse aus theme.ts
export const formatDiff = (value: number) => value > 0 ? `+${value}` : `${value}`;
export const getDiffClass = (value: number) => value > 0 ? 'bp-value-up' : value < 0 ? 'bp-value-down' : '';
