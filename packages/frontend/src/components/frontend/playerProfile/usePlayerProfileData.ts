import { computed, ref, watch, type Ref } from 'vue';
import { getPlayerProfileData } from './PlayerProfileUtilFunctions';

const trendPeriodOptions = [
    { label: 'Gesamte Zeit', value: 'all' as TrendPeriod },
    { label: 'Letzter Monat', value: '1m' as TrendPeriod },
    { label: 'Letzte 3 Monate', value: '3m' as TrendPeriod },
    { label: 'Letzte 6 Monate', value: '6m' as TrendPeriod },
    { label: 'Letztes Jahr', value: '1y' as TrendPeriod },
];

export const usePlayerProfileData = (playerName: Ref<string>, shouldLoad?: Ref<boolean>) => {
    const isLoading = ref(true);
    const profileData = ref<PlayerProfileData | null>(null);
    const trendPeriod = ref<TrendPeriod>('all');

    const loadProfile = async () => {
        if (shouldLoad && !shouldLoad.value) {
            isLoading.value = false;
            return;
        }

        if (!playerName.value) {
            profileData.value = null;
            isLoading.value = false;
            return;
        }

        isLoading.value = true;
        try {
            profileData.value = await getPlayerProfileData(playerName.value, trendPeriod.value);
            if (profileData.value.totalMatches === 0) profileData.value = null;
        } catch {
            profileData.value = null;
        }
        isLoading.value = false;
    };

    watch([playerName, trendPeriod], () => {
        if (!shouldLoad || shouldLoad.value) loadProfile();
    }, { immediate: true });

    if (shouldLoad) {
        watch(shouldLoad, (visible) => {
            if (visible) loadProfile();
        });
    }

    return {
        isLoading,
        profileData,
        trendPeriod,
        trendPeriodOptions,
        loadProfile,
    };
};
