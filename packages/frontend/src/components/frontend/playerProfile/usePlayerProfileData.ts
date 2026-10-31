import { computed, ref, shallowRef, type Ref } from 'vue';
import { buildPlayerProfileData } from './PlayerProfileUtilFunctions';
import { onGameSaved } from '@/components/shared/GameEntry/useAddGame';
import { GameData, getCachedGameData, getGameData } from '@/util/gameDataCache';

export const trendPeriodOptions = [
    { label: 'Gesamte Zeit', value: 'all' as TrendPeriod },
    { label: 'Letzter Monat', value: '1m' as TrendPeriod },
    { label: 'Letzte 3 Monate', value: '3m' as TrendPeriod },
    { label: 'Letzte 6 Monate', value: '6m' as TrendPeriod },
    { label: 'Letztes Jahr', value: '1y' as TrendPeriod },
];

// Alle Spiele kommen aus dem geteilten gameDataCache: schon geladene Daten (z.B. von der Weltrangliste)
// werden sofort angezeigt, das Profil selbst wird lokal berechnet. Zeitraum-Wechsel laedt nichts nach.
export const usePlayerProfileData = (playerName: Ref<string>) => {
    const gameData = shallowRef<GameData | null>(getCachedGameData());
    const isLoading = ref(!gameData.value);
    const hasError = ref(false);
    const trendPeriod = ref<TrendPeriod>('all');

    // Bei Fehler bleibt ein schon angezeigtes Profil stehen
    const loadData = () => getGameData()
        .then(data => {
            gameData.value = data;
            hasError.value = false;
        })
        .catch(() => { if (!gameData.value) hasError.value = true; })
        .finally(() => isLoading.value = false);

    loadData();
    onGameSaved(loadData);

    // null = Spieler ohne Spiele
    const profileData = computed<PlayerProfileData | null>(() => {
        if (!gameData.value || !playerName.value) return null;
        const data = buildPlayerProfileData(gameData.value, playerName.value, trendPeriod.value);
        return data.allTimeMatches > 0 ? data : null;
    });

    return {
        isLoading,
        hasError,
        profileData,
        trendPeriod,
    };
};
