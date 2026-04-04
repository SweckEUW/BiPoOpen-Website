import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  query: Record<string, string | string[]>;
}

interface VercelResponse extends ServerResponse {
  status(code: number): VercelResponse;
  send(body: string): VercelResponse;
  setHeader(name: string, value: string): this;
}

const MAIN_COLOR = '#EA5160';
const SITE_URL = 'https://bipoopen.de';

const TITLE = 'Weck BiPo Open';
const DESCRIPTION = 'Professionelles Bierpong Turnier seit 2020';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const ogImageUrl = `${SITE_URL}/api/og-image-default`;

  const html = `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <meta property="og:site_name" content="${TITLE}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${SITE_URL}/" />
    <meta property="og:title" content="${TITLE}" />
    <meta property="og:description" content="${DESCRIPTION}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <meta name="description" content="${DESCRIPTION}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${TITLE}" />
    <meta name="twitter:description" content="${DESCRIPTION}" />
    <meta name="twitter:image" content="${ogImageUrl}" />

    <meta name="theme-color" content="${MAIN_COLOR}" />
    <link rel="canonical" href="${SITE_URL}/" />

    <title>${TITLE}</title>
  </head>
  <body>
    <p>Weiterleitung zu <a href="${SITE_URL}">${TITLE}</a></p>
  </body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  res.status(200).send(html);
}
