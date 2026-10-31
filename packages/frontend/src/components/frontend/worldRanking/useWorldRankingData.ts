import { ref, shallowRef } from 'vue';
import { onGameSaved } from '@/components/shared/GameEntry/useAddGame';
import { getCachedGameData, getGameData } from '@/util/gameDataCache';
import { RankingData } from './eloRating';

export function useWorldRankingData() {
    const now = ref(Date.now());
    // Schon geladene Daten (z.B. vom Spielerprofil) sofort anzeigen, im Hintergrund aktualisieren.
    const data = shallowRef<RankingData | null>(getCachedGameData());
    const isLoading = ref(!data.value);
    const hasError = ref(false);

    // Neuladen nach einem eingetragenen Spiel ohne Ladebildschirm, bei Fehler bleibt die alte Rangliste stehen.
    const loadData = (isReload = false) =>
        getGameData()
            .then(gameData => {
                now.value = Date.now();
                data.value = gameData;
                hasError.value = false;
            })
            .catch(() => { if (!isReload && !data.value) hasError.value = true; })
            .finally(() => isLoading.value = false);

    loadData();
    onGameSaved(() => loadData(true));

    return { now, data, isLoading, hasError };
}
