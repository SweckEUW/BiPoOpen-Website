import { BIPO_OPEN_TOURNAMENT_YEARS, NEXT_BIPO_OPEN } from '@/util/bipoOpenTournamentMeta';

export type DrivePhoto = { img_id: string; name: string };

// Turnier fuer den BiPo-Open-Slide und die Foto-Kacheln.
export const LAST_TOURNAMENT_YEAR = BIPO_OPEN_TOURNAMENT_YEARS[BIPO_OPEN_TOURNAMENT_YEARS.length - 1];

// Anpfiff des naechsten Turniers fuer den Countdown-Slide.
export const NEXT_BIPO_OPEN_START = new Date(`${NEXT_BIPO_OPEN.date}T14:00:00`).getTime();

// Foto-Listen aller Turniere, lazy als eigene Chunks
const DRIVE_PHOTO_FILES = import.meta.glob<DrivePhoto[]>('/src/assets/*/driveImageIDs.json', { import: 'default' });

// Zufaellig gemischte Fotos aus allen Turnieren. Slider und Kacheln teilen sich den Ladevorgang.
// Im Dev-Modus feste Reihenfolge: Jeder Reload laedt dieselben Fotos aus dem Browser-Cache,
// sonst drosselt Google nach ein paar HMR-Reloads mit 429.
let allPhotosPromise: Promise<DrivePhoto[]> | undefined;
export const loadAllTournamentPhotos = () => {
    allPhotosPromise ??= Promise.allSettled(Object.values(DRIVE_PHOTO_FILES).map(load => load()))
        .then(results => results.flatMap(result => result.status === 'fulfilled' ? result.value : []));
    return allPhotosPromise.then(photos => import.meta.env.DEV ? [...photos].reverse() : shuffle(photos));
};

// Direkt vom Google-CDN statt ueber drive.google.com/thumbnail (das ist stark rate-limitiert -> 429)
export const getDriveThumbnail = (imgId: string, width: number) =>
    `https://lh3.googleusercontent.com/d/${imgId}=w${width}`;

export const shuffle = <T>(items: T[]): T[] => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// Namen offener Spiele sind frei eingetippt: "nick  brinkrolf" -> "Nick Brinkrolf"
export const formatPlayerName = (name: string) => name
    .trim()
    .split(/\s+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

// Offene Spiele des aktuellen Monats, am Monatsanfang ohne Spiele die des Vormonats.
export const getLatestOpenGamesMonth = (openGames: Match[]) => {
    const now = new Date();

    for (const monthOffset of [0, 1]) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1).getTime();
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - monthOffset + 1, 1).getTime();
        const games = openGames.filter(match => (match.time ?? 0) >= monthStart && (match.time ?? 0) < monthEnd);
        if (games.length)
            return { games, monthStart, isCurrentMonth: monthOffset === 0 };
    }

    return null;
};
