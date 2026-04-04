import { ImageResponse } from '@vercel/og';

const MAIN_COLOR = '#EA5160';
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const SITE_URL = 'https://bipoopen.de';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || '';

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
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
        },
        children: [
          {
            type: 'img',
            props: {
              src: `${SITE_URL}/metaImage.jpg`,
              width: 280,
              height: 280,
              style: {
                borderRadius: '50%',
                border: '12px solid white',
              },
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: 72,
                fontWeight: 800,
                color: 'white',
                lineHeight: 1.1,
              },
              children: 'Weck BiPo Open',
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: 32,
                fontWeight: 600,
                color: '#FFE7EA',
              },
              children: title || 'Professionelles Bierpong Turnier seit 2020',
            },
          },
        ],
      },
    },
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
  );
}
