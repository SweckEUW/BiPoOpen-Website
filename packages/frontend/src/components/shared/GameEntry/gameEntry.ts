import { computed, ref } from 'vue';

// Datenmodell des GameEntryDrawer: zwei Seiten mit Spielern und deren Treffern.
// Bewusst unabhaengig von Match, damit offene Spiele, Liga, Pokal und Turnier denselben Drawer nutzen.

export type GameEntryPlayer = {
    name: string;
    score: number | null;   // null = noch keine Treffer gewaehlt
};

export type GameEntrySide = {
    name?: string;          // Teamname (Turnier), sonst ergibt sich der Name aus den Spielern
    logo?: string;
    players: GameEntryPlayer[];
};

export const createEmptySides = (playersPerSide = 1): GameEntrySide[] =>
    [0, 1].map(() => ({ players: Array.from({ length: playersPerSide }, () => ({ name: '', score: null })) }));

export const getSideName = (side: GameEntrySide) =>
    side.name || side.players.map(player => player.name.trim()).filter(name => name).join(' & ');

// Summe der Treffer, null solange ein Spieler noch keine Treffer hat.
export const getSideScore = (side: GameEntrySide) =>
    side.players.every(player => player.score !== null)
        ? side.players.reduce((sum, player) => sum + (player.score ?? 0), 0)
        : null;

// Turnierspiele speichern das Ergebnis (noch) als result-Objekt statt an den Spielern.
const getLegacyPlayerScore = (match: Match, teamIndex: number, playerIndex: number): number | undefined => {
    const score = (match as any).result?.[`team${teamIndex + 1}Player${playerIndex + 1}Score`];
    return typeof score === 'number' ? score : undefined;
}

export const matchToSides = (match: Match): GameEntrySide[] =>
    [match.team1, match.team2].map((team, teamIndex) => ({
        name: team.name,
        logo: team.logo,
        players: team.players.map((player, playerIndex) => ({
            name: player.name ?? '',
            score: getLegacyPlayerScore(match, teamIndex, playerIndex) ?? player.score ?? null,
        })),
    }));

const toTeam = (side: GameEntrySide, baseTeam?: Team): Team => ({
    ...(baseTeam ?? { _id: 'placeholder' }),
    players: side.players.map((player, index) => ({
        ...(baseTeam?.players[index] ?? { _id: 'placeholder' }),
        name: player.name.trim(),
        score: player.score ?? 0,
    })),
});

// Bestehendes Spiel mit den Werten aus dem Drawer (Kopie, das Original bleibt unveraendert).
export const applySidesToMatch = (match: Match, sides: GameEntrySide[]): Match => ({
    ...JSON.parse(JSON.stringify(match)),
    team1: toTeam(sides[0], match.team1),
    team2: toTeam(sides[1], match.team2),
});

// Neues Spiel, extra z.B. { season, league } oder { cupId, cupRound }.
export const sidesToNewMatch = (sides: GameEntrySide[], extra: Partial<Match> = {}): Match => ({
    _id: 'placeholder',
    time: new Date().getTime(),
    ...extra,
    team1: toTeam(sides[0]),
    team2: toTeam(sides[1]),
});

// Backend: ein Drawer pro Seite, MatchElement meldet per @edit, welches Spiel bearbeitet wird.
export function useMatchEdit() {
    const editingMatch = ref<Match>();
    const editVisible = ref(false);
    const editSides = computed(() => editingMatch.value ? matchToSides(editingMatch.value) : undefined);

    const openEdit = (match: Match) => {
        editingMatch.value = match;
        editVisible.value = true;
    }

    return { editingMatch, editVisible, editSides, openEdit };
}
