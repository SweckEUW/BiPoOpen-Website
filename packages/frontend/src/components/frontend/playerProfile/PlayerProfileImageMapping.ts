import { getPlayerForLeagueTeam } from './LeaguePlayerMapping';

// Zuordnung: Echter Spielername -> Profilbild-URL
// Tipp: Lege Bilder unter frontend/public/playerProfiles/ ab und nutze z.B. '/playerProfiles/simon-weck.jpg'
export const PLAYER_PROFILE_IMAGE_MAP: Record<string, string> = {
    'Simon Weck': "/src/assets/playerProfiles/simon-weck.jpg"
    // 'David Jones': '/playerProfiles/david-jones.jpg',
};

const toTitleCase = (value: string): string =>
    value
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');

const resolveCanonicalPlayerName = (name: string): string => {
    const formattedName = toTitleCase(name);
    return getPlayerForLeagueTeam(formattedName) ?? formattedName;
};

export const getPlayerProfileImage = (playerOrTeamName: string): string | null => {
    const canonicalName = resolveCanonicalPlayerName(playerOrTeamName);
    if (PLAYER_PROFILE_IMAGE_MAP[canonicalName]) 
        return PLAYER_PROFILE_IMAGE_MAP[canonicalName];
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
