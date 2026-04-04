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

const splitNameForLayout = (name: string): [string, string | null] => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return ['', null];
  if (parts.length === 1) return [name, null];
  if (parts.length === 2 && name.length >= 16) return [parts[0], parts[1]];
  if (parts.length <= 2) return [name, null];
  return [parts.slice(0, 2).join(' '), parts.slice(2).join(' ')];
};

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
  const [lineOne, lineTwo] = splitNameForLayout(playerName);
  const imageData = await fetchPlayerImage(playerName);
  const initials = getPlayerInitials(playerName);

  const avatarElement = imageData
    ? {
        type: 'img' as const,
        props: {
          src: imageData,
          width: 280,
          height: 280,
          style: {
            borderRadius: '50%',
            objectFit: 'cover' as const,
            border: '12px solid white',
          },
        },
      }
    : {
        type: 'div' as const,
        props: {
          style: {
            width: 280,
            height: 280,
            borderRadius: '50%',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '12px solid white',
            fontSize: 100,
            fontWeight: 700,
            color: MAIN_COLOR,
          },
          children: initials,
        },
      };

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
                    style: {
                      fontSize: 44,
                      fontWeight: 700,
                      color: '#FFE7EA',
                      marginBottom: 20,
                    },
                    children: 'Spielerprofil',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 84,
                      fontWeight: 800,
                      color: 'white',
                      lineHeight: 1.1,
                    },
                    children: lineOne,
                  },
                },
                ...(lineTwo
                  ? [
                      {
                        type: 'div' as const,
                        props: {
                          style: {
                            fontSize: 72,
                            fontWeight: 700,
                            color: 'white',
                            lineHeight: 1.1,
                            marginTop: 8,
                          },
                          children: lineTwo,
                        },
                      },
                    ]
                  : []),
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
