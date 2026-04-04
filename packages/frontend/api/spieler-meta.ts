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

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const formatDisplayName = (slug: string): string =>
  decodeURIComponent(slug).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function handler(req: VercelRequest, res: VercelResponse) {
  const nameParam = (req.query.name as string) || '';
  if (!nameParam.trim()) {
    res.status(400).send('Missing name parameter');
    return;
  }

  const playerName = formatDisplayName(nameParam);
  const safeName = escapeHtml(playerName);
  const encodedName = encodeURIComponent(nameParam);
  const playerSlug = encodeURIComponent(nameParam).replaceAll('%20', '-');

  const title = `Spielerprofil von ${safeName} | Weck BiPo Open Turnierserie`;
  const description = `Entdecke das offizielle Spielerprofil von ${safeName} bei den Weck BiPo Open mit Teamhistorie, Turnierstationen und direkten Einblicken in aktuelle Ergebnisse.`;
  const ogImageUrl = `${SITE_URL}/api/og-image?name=${encodedName}`;
  const canonicalUrl = `${SITE_URL}/Spieler/${playerSlug}`;

  const html = `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <meta property="og:site_name" content="Weck BiPo Open" />
    <meta property="og:type" content="profile" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Spielerprofil von ${safeName}" />

    <meta name="description" content="${description}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImageUrl}" />

    <meta name="theme-color" content="${MAIN_COLOR}" />
    <link rel="canonical" href="${canonicalUrl}" />

    <title>${title}</title>
  </head>
  <body>
    <p>Weiterleitung zu <a href="${canonicalUrl}">${safeName}</a></p>
  </body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(html);
}
