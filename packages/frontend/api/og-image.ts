import { ImageResponse } from '@vercel/og';

const MAIN_COLOR = '#EA5160';
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const BACKEND_BASE_URL = 'https://bipoopen-backend.vercel.app';

const getPlayerInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
};

const formatDisplayName = (slug: string): string =>
  decodeURIComponent(slug).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const fetchPlayerImage = async (playerName: string): Promise<string | null> => {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/playerImages/get/${encodeURIComponent(playerName)}`);
    if (res.status !== 200) return null;
    const data = await res.json();
    return data?.imageData || null;
  } catch {
    return null;
  }
};

// --- Stats types ---
type MatchPlayer = { name: string; score?: number };
type MatchTeam = { name?: string; players: MatchPlayer[] };
type GameMatch = { team1: MatchTeam; team2: MatchTeam };
type TournamentMatch = {
  team1?: MatchTeam;
  team2?: MatchTeam;
  result?: {
    team1Score: number; team2Score: number;
    team1Player1Score?: number; team1Player2Score?: number;
    team2Player1Score?: number; team2Player2Score?: number;
  };
};
type TournamentData = {
  groupPhase?: { matches?: TournamentMatch[][] };
  koPhase?: { matches?: TournamentMatch[][] };
  settings?: { trackPlayerShots?: boolean };
};
type ModeStats = { matches: number; wins: number; losses: number; winrate: number; totalHits: number; averageHits: number };

function computeGameStats(games: GameMatch[], playerName: string): { matches: number; wins: number; hits: number } {
  let matches = 0, wins = 0, hits = 0;
  const nameLower = playerName.toLowerCase();

  for (const game of games) {
    const t1 = game.team1?.players ?? [];
    const t2 = game.team2?.players ?? [];
    const inT1 = t1.some(p => p.name?.toLowerCase() === nameLower);
    const inT2 = t2.some(p => p.name?.toLowerCase() === nameLower);
    if (!inT1 && !inT2) continue;

    const t1Score = t1.reduce((s, p) => s + (p.score ?? 0), 0);
    const t2Score = t2.reduce((s, p) => s + (p.score ?? 0), 0);
    if (t1Score === 0 && t2Score === 0) continue;

    matches++;
    const team1Won = t1Score > t2Score;
    if ((inT1 && team1Won) || (inT2 && !team1Won)) wins++;

    const player = (inT1 ? t1 : t2).find(p => p.name?.toLowerCase() === nameLower);
    hits += player?.score ?? 0;
  }
  return { matches, wins, hits };
}

function computeTournamentStats(tournaments: TournamentData[], playerName: string): { matches: number; wins: number; hits: number } {
  let matches = 0, wins = 0, hits = 0;
  const nameLower = playerName.toLowerCase();

  for (const t of tournaments) {
    const allMatches = [
      ...(t.groupPhase?.matches?.flat() ?? []),
      ...(t.koPhase?.matches?.flat() ?? []),
    ];
    for (const m of allMatches) {
      if (!m.team1?.players || !m.team2?.players || !m.result) continue;
      if (m.result.team1Score === 0 && m.result.team2Score === 0) continue;

      const inT1 = m.team1.players.some(p => p.name?.toLowerCase() === nameLower);
      const inT2 = m.team2.players.some(p => p.name?.toLowerCase() === nameLower);
      if (!inT1 && !inT2) continue;

      matches++;
      const team1Won = m.result.team1Score > m.result.team2Score;
      if ((inT1 && team1Won) || (inT2 && !team1Won)) wins++;

      if (t.settings?.trackPlayerShots) {
        if (inT1) {
          const idx = m.team1.players.findIndex(p => p.name?.toLowerCase() === nameLower);
          hits += idx === 0 ? (m.result.team1Player1Score ?? 0) : (m.result.team1Player2Score ?? 0);
        } else {
          const idx = m.team2.players.findIndex(p => p.name?.toLowerCase() === nameLower);
          hits += idx === 0 ? (m.result.team2Player1Score ?? 0) : (m.result.team2Player2Score ?? 0);
        }
      }
    }
  }
  return { matches, wins, hits };
}

async function fetchPlayerStats(playerName: string): Promise<{ stats1v1: ModeStats; stats2v2: ModeStats } | null> {
  try {
    const [openGames, leagueGames, tournaments] = await Promise.all([
      fetch(`${BACKEND_BASE_URL}/openGames/get`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${BACKEND_BASE_URL}/leagueGames/get`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${BACKEND_BASE_URL}/tournaments/get`).then(r => r.ok ? r.json() : []).catch(() => []),
    ]);

    const open1v1 = computeGameStats(
      (openGames as GameMatch[]).filter(g => g.team1?.players?.length === 1 && g.team2?.players?.length === 1),
      playerName,
    );
    const league = computeGameStats(
      (leagueGames as GameMatch[]).filter(g => g.team1?.players?.length === 1 && g.team2?.players?.length === 1),
      playerName,
    );
    const open2v2 = computeGameStats(
      (openGames as GameMatch[]).filter(g => g.team1?.players?.length === 2 && g.team2?.players?.length === 2),
      playerName,
    );
    const tournamentStats = computeTournamentStats(tournaments as TournamentData[], playerName);

    const build = (a: { matches: number; wins: number; hits: number }, b: { matches: number; wins: number; hits: number }): ModeStats => {
      const matches = a.matches + b.matches;
      const wins = a.wins + b.wins;
      const losses = matches - wins;
      const totalHits = a.hits + b.hits;
      return {
        matches, wins, losses,
        winrate: matches > 0 ? Math.round((wins / matches) * 100) : 0,
        totalHits,
        averageHits: matches > 0 ? Math.round((totalHits / matches) * 10) / 10 : 0,
      };
    };

    return {
      stats1v1: build(open1v1, league),
      stats2v2: build(open2v2, tournamentStats),
    };
  } catch {
    return null;
  }
}

// --- Satori element helpers ---
function statCard(label: string, stats: ModeStats) {
  return {
    type: 'div' as const,
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column' as const,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        padding: '24px 32px',
        flex: 1,
        gap: 8,
      },
      children: [
        {
          type: 'div' as const,
          props: {
            style: { fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 4 },
            children: label,
          },
        },
        {
          type: 'div' as const,
          props: {
            style: { display: 'flex', alignItems: 'baseline' as const, gap: 8 },
            children: [
              { type: 'div' as const, props: { style: { fontSize: 48, fontWeight: 800, color: 'white' }, children: `${stats.winrate}%` } },
              { type: 'div' as const, props: { style: { fontSize: 22, fontWeight: 600, color: '#FFE7EA' }, children: 'Siege' } },
            ],
          },
        },
        {
          type: 'div' as const,
          props: {
            style: { display: 'flex', gap: 12, fontSize: 22, fontWeight: 600 },
            children: [
              { type: 'div' as const, props: { style: { color: 'white' }, children: `${stats.matches} Spiele` } },
              { type: 'div' as const, props: { style: { color: '#90EE90' }, children: `${stats.wins}S` } },
              { type: 'div' as const, props: { style: { color: '#FFB6B6' }, children: `${stats.losses}N` } },
            ],
          },
        },
        {
          type: 'div' as const,
          props: {
            style: { display: 'flex', gap: 12, fontSize: 22, fontWeight: 600, color: '#FFE7EA' },
            children: [
              { type: 'div' as const, props: { children: `∅ ${stats.averageHits} Treffer` } },
              { type: 'div' as const, props: { children: `· ${stats.totalHits} gesamt` } },
            ],
          },
        },
      ],
    },
  };
}

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const nameParam = searchParams.get('name');

  if (!nameParam || !nameParam.trim()) {
    return new Response('Missing name parameter', { status: 400 });
  }

  const playerName = formatDisplayName(nameParam);
  const [imageData, statsResult] = await Promise.all([
    fetchPlayerImage(playerName),
    fetchPlayerStats(playerName),
  ]);

  const initials = getPlayerInitials(playerName);

  const avatarSize = statsResult ? 140 : 280;
  const avatarElement = imageData
    ? {
        type: 'img' as const,
        props: {
          src: imageData,
          width: avatarSize,
          height: avatarSize,
          style: {
            borderRadius: '50%',
            objectFit: 'cover' as const,
            border: `${statsResult ? 6 : 12}px solid white`,
          },
        },
      }
    : {
        type: 'div' as const,
        props: {
          style: {
            width: avatarSize,
            height: avatarSize,
            borderRadius: '50%',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `${statsResult ? 6 : 12}px solid white`,
            fontSize: statsResult ? 52 : 100,
            fontWeight: 700,
            color: MAIN_COLOR,
          },
          children: initials,
        },
      };

  // Layout with stats
  if (statsResult) {
    return new ImageResponse(
      {
        type: 'div',
        props: {
          style: {
            width: OG_WIDTH,
            height: OG_HEIGHT,
            backgroundColor: MAIN_COLOR,
            display: 'flex',
            flexDirection: 'column' as const,
            padding: '40px 60px',
          },
          children: [
            // Top: Avatar + Name
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'row' as const,
                  alignItems: 'center',
                  gap: 28,
                  marginBottom: 32,
                },
                children: [
                  avatarElement,
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', flexDirection: 'column' as const },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: { fontSize: 28, fontWeight: 700, color: '#FFE7EA' },
                            children: 'Spielerprofil',
                          },
                        },
                        {
                          type: 'div',
                          props: {
                            style: { fontSize: 56, fontWeight: 800, color: 'white', lineHeight: 1.1 },
                            children: playerName,
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
            // Bottom: Stat cards
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'row' as const,
                  gap: 24,
                  flex: 1,
                },
                children: [
                  statCard('1v1', statsResult.stats1v1),
                  statCard('2v2', statsResult.stats2v2),
                ],
              },
            },
          ],
        },
      },
      {
        width: OG_WIDTH,
        height: OG_HEIGHT,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      },
    );
  }

  // Fallback: no stats (original layout)
  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          width: OG_WIDTH,
          height: OG_HEIGHT,
          backgroundColor: MAIN_COLOR,
          display: 'flex',
          flexDirection: 'row' as const,
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '60px 80px',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column' as const,
                justifyContent: 'center',
                maxWidth: 680,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { fontSize: 44, fontWeight: 700, color: '#FFE7EA', marginBottom: 20 },
                    children: 'Spielerprofil',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { fontSize: 84, fontWeight: 800, color: 'white', lineHeight: 1.1 },
                    children: playerName,
                  },
                },
              ],
            },
          },
          avatarElement,
        ],
      },
    },
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  );
}
