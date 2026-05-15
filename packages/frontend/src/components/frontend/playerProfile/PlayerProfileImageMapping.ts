import { LEAGUE_PLAYER_DATA } from '@/components/frontend/league/LeaguePlayersData';
import axios from 'axios';
import { reactive } from 'vue';

const CACHE_PREFIX = 'playerImg_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function readFromLocalStorage(key: string): string | null | undefined {
    try {
        const raw = localStorage.getItem(CACHE_PREFIX + key);
        if (!raw) return undefined;
        const entry = JSON.parse(raw) as { data: string | null; ts: number };
        if (Date.now() - entry.ts > CACHE_TTL_MS) {
            localStorage.removeItem(CACHE_PREFIX + key);
            return undefined;
        }
        return entry.data;
    } catch {
        return undefined;
    }
}

function writeToLocalStorage(key: string, data: string | null): void {
    try {
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
    } catch {
        // QuotaExceededError or similar — silently ignore
    }
}

function removeFromLocalStorage(key: string): void {
    try {
        localStorage.removeItem(CACHE_PREFIX + key);
    } catch {
        // ignore
    }
}

// Reactive cache for backend-fetched profile images
export const backendImageCache = reactive<Record<string, string | null>>({});
const pendingFetches = new Map<string, Promise<string | null>>();

export const fetchPlayerProfileImage = async (playerName: string): Promise<string | null> => {
    const key = normalizeName(playerName);
    if (key in backendImageCache) return backendImageCache[key];

    const stored = readFromLocalStorage(key);
    if (stored !== undefined) {
        backendImageCache[key] = stored;
        return stored;
    }

    if (pendingFetches.has(key)) return pendingFetches.get(key)!;

    const promise = axios
        .get(`/playerImages/get/${encodeURIComponent(playerName)}`, {
            validateStatus: (status) => status === 200 || status === 404,
        })
        .then((res) => {
            const imageData = res.status === 200 ? (res.data?.imageData || null) : null;
            backendImageCache[key] = imageData;
            writeToLocalStorage(key, imageData);
            pendingFetches.delete(key);
            return imageData;
        })
        .catch(() => {
            backendImageCache[key] = null;
            pendingFetches.delete(key);
            return null;
        });

    pendingFetches.set(key, promise);
    return promise;
};

export const getPlayerProfileImageFromBackend = async (playerName: string): Promise<string | null> => {
    return fetchPlayerProfileImage(playerName);
};

export const invalidatePlayerProfileImageCache = (playerName: string) => {
    const key = normalizeName(playerName);
    delete backendImageCache[key];
    pendingFetches.delete(key);
    removeFromLocalStorage(key);
};

export const getPlayerProfileImage = (playerOrTeamName: string): string | null => {
    // Check backend cache first (reactive — will update when fetched)
    const backendKey = normalizeName(playerOrTeamName);
    if (backendKey in backendImageCache && backendImageCache[backendKey]) {
        return backendImageCache[backendKey];
    }

    const normalizedInput = normalizeName(playerOrTeamName);
    const leagueTeam = LEAGUE_PLAYER_DATA.find(entry => normalizeName(entry.teamName) === normalizedInput);
    if (leagueTeam?.logo) return leagueTeam.logo;

    return null;
};

export const getPlayerInitials = (playerOrTeamName: string): string => {
    const canonicalName = toTitleCase(playerOrTeamName);
    const parts = canonicalName
        .split(/\s+/)
        .map(part => part.trim())
        .filter(Boolean);

    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

const normalizeName = (value: string): string =>
    value
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();

const toTitleCase = (value: string): string =>
    value
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
