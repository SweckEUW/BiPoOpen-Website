import { computed, inject, provide, type ComponentPublicInstance, type ComputedRef, type InjectionKey, type Ref } from 'vue';
import { useElementHeight } from './useElementHeight';

// Gestapelte Sticky-Ebenen ohne hardcodierte top-Werte:
// Jede Sticky-Leiste misst ihre Hoehe und gibt ihren Kind-Komponenten weiter,
// wo deren Sticky-Inhalt (z.B. ein Tabellenkopf) kleben muss.
const STICKY_TOP: InjectionKey<ComputedRef<string>> = Symbol('stickyTop');
const APP_HEADER_TOP = computed(() => 'var(--app-header-height)');

// top-Wert fuer Sticky-Inhalt: direkt unter dem App-Header und allen Sticky-Leisten der Eltern.
export function useStickyTop() {
    return inject(STICKY_TOP, APP_HEADER_TOP);
}

// Meldet eine Sticky-Leiste an: sie klebt unter den Leisten der Eltern,
// Sticky-Inhalt der Kind-Komponenten klebt direkt unter ihr.
// Pro Komponente nur eine Leiste - aufeinanderfolgende Sticky-Elemente in einen Wrapper packen.
// Rueckgabe: top-Wert der Leiste selbst.
export function useStickyBar(bar: Ref<HTMLElement | ComponentPublicInstance | null>) {
    const top = useStickyTop();
    const height = useElementHeight(bar);
    provide(STICKY_TOP, computed(() => `calc(${top.value} + ${height.value}px)`));
    return top;
}

// Fuer eigene Scroll-Container (z.B. BottomSheet): Sticky-Inhalt klebt an deren Oberkante.
export function resetStickyTop() {
    provide(STICKY_TOP, computed(() => '0px'));
}
