import { LEAGUE_PLAYER_DATA } from '@/components/frontend/league/LeaguePlayersData';

export const PLAYER_PROFILE_IMAGE_MAP: Record<string, string> = {
    'Simon Weck': new URL('/src/assets/playerProfiles/simon-weck.jpg', import.meta.url).href,
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

const resolveCanonicalPlayerName = (name: string): string => {
    const formattedName = toTitleCase(name);
    return formattedName;
};

export const getPlayerProfileImage = (playerOrTeamName: string): string | null => {
    const normalizedInput = normalizeName(playerOrTeamName);
    const leagueTeam = LEAGUE_PLAYER_DATA.find(entry => normalizeName(entry.teamName) === normalizedInput);
    if (leagueTeam?.logo) return leagueTeam.logo;

    const canonicalName = resolveCanonicalPlayerName(playerOrTeamName);
    if (PLAYER_PROFILE_IMAGE_MAP[canonicalName]) 
        return new URL(PLAYER_PROFILE_IMAGE_MAP[canonicalName], import.meta.url).href;
    return null;
};

export const getPlayerInitials = (playerOrTeamName: string): string => {
    const canonicalName = resolveCanonicalPlayerName(playerOrTeamName);
    const parts = canonicalName
        .split(/\s+/)
        .map(part => part.trim())
        .filter(Boolean);

    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};
