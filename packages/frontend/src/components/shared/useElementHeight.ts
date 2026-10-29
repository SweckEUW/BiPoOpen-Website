import { onBeforeUnmount, ref, watch, type ComponentPublicInstance, type Ref } from 'vue';

// Misst die Hoehe eines Elements (oder einer Komponente) laufend mit,
// z.B. um gestapelte Sticky-Ebenen exakt untereinander zu setzen.
export function useElementHeight(target: Ref<HTMLElement | ComponentPublicInstance | null>) {
    const height = ref(0);
    let resizeObserver: ResizeObserver | undefined;

    watch(target, (value) => {
        resizeObserver?.disconnect();

        const element = value instanceof HTMLElement ? value : value?.$el as HTMLElement | undefined;
        if (!element) {
            height.value = 0;
            return;
        }

        resizeObserver = new ResizeObserver(() => {
            height.value = element.offsetHeight;
        });
        resizeObserver.observe(element);
        height.value = element.offsetHeight;
    }, { immediate: true, flush: 'post' });

    onBeforeUnmount(() => resizeObserver?.disconnect());

    return height;
}
