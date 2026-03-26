import fs from 'fs';
import path from 'path';

const MAIN_COLOR = '#EA5160';
const GENERATED_ROOT_RELATIVE = 'Spieler';
const LEAGUE_PLAYER_DATA_RELATIVE = path.join('src', 'components', 'frontend', 'league', 'LeaguePlayersData.ts');
const PROFILE_IMAGES_SOURCE_RELATIVE = path.join('src', 'assets', 'playerProfiles');
const GENERATED_OG_IMAGES_RELATIVE = path.join('.generated', 'playerProfiles', 'generated');

const routeSlugFromName = (name: string): string => encodeURIComponent(name).replaceAll('%20', '-');

const imageSlugFromName = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

const getPlayerInitials = (name: string): string => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const getMimeTypeForExtension = (ext: string): string => {
  const normalized = ext.toLowerCase();
  if (normalized === '.jpg' || normalized === '.jpeg') return 'image/jpeg';
  if (normalized === '.png') return 'image/png';
  if (normalized === '.webp') return 'image/webp';
  if (normalized === '.gif') return 'image/gif';
  if (normalized === '.svg') return 'image/svg+xml';
  return 'application/octet-stream';
};

const toDataUri = (filePath: string): string => {
  const ext = path.extname(filePath);
  const mimeType = getMimeTypeForExtension(ext);
  const content = fs.readFileSync(filePath);
  return `data:${mimeType};base64,${content.toString('base64')}`;
};

const createAvatarOgSvg = (playerName: string, imageDataUri: string | null): string => {
  const safePlayerName = escapeHtml(playerName);
  const initials = escapeHtml(getPlayerInitials(playerName));

  const imageMarkup = imageDataUri
    ? `<circle cx="300" cy="300" r="222" fill="#ffffff" />
    <clipPath id="avatarClip">
      <circle cx="300" cy="300" r="210" />
    </clipPath>
    <image href="${imageDataUri}" x="90" y="90" width="420" height="420" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatarClip)" />`
    : `<circle cx="300" cy="300" r="222" fill="#ffffff" />
    <circle cx="300" cy="300" r="210" fill="#ffffff" />
    <text x="300" y="300" text-anchor="middle" dominant-baseline="central" font-family="Arial, Helvetica, sans-serif" font-size="140" font-weight="700" fill="${MAIN_COLOR}">${initials}</text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" role="img" aria-label="${safePlayerName}">
  <rect width="600" height="600" fill="${MAIN_COLOR}" />
  ${imageMarkup}
</svg>
`;
};

const createPlayerPreviewHtml = (playerName: string, ogImagePath: string): string => {
  const safeName = escapeHtml(playerName);
  const playerSlug = routeSlugFromName(playerName);
  const safeSlug = escapeHtml(playerSlug);
  const title = `${safeName} | Spielerprofil | Weck BiPo Open`;
  const description = `Zum Spielerprofil von ${safeName} beim Weck BiPo Open.`;

  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <meta property="og:site_name" content="Weck BiPo Open" />
    <meta property="og:type" content="profile" />
    <meta property="og:url" content="https://bipoopen.de/Spieler/${safeSlug}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="https://bipoopen.de${ogImagePath}" />
    <meta property="og:image:alt" content="Profilbild von ${safeName}" />

    <meta name="description" content="${description}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="https://bipoopen.de${ogImagePath}" />

    <meta name="theme-color" content="${MAIN_COLOR}" />
    <meta name="apple-mobile-web-app-status-bar-style" content="${MAIN_COLOR}" />
    <meta name="msapplication-navbutton-color" content="${MAIN_COLOR}" />

    <title>${title}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`;
};

const extractPlayerNames = (leaguePlayerDataPath: string): string[] => {
  const fileContent = fs.readFileSync(leaguePlayerDataPath, 'utf-8');
  const regex = /playerName:\s*'([^']+)'/g;
  const playerNames = new Set<string>();

  for (const match of fileContent.matchAll(regex)) {
    const playerName = match[1]?.trim();
    if (playerName) playerNames.add(playerName);
  }

  return [...playerNames].sort((a, b) => a.localeCompare(b));
};

const buildSourceImageMap = (sourceDir: string): Map<string, string> => {
  const imageMap = new Map<string, string>();
  if (!fs.existsSync(sourceDir)) return imageMap;

  const files = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (const file of files) {
    if (!file.isFile()) continue;
    const ext = path.extname(file.name).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) continue;

    const baseName = path.basename(file.name, ext).toLowerCase();
    imageMap.set(baseName, path.join(sourceDir, file.name));
  }

  return imageMap;
};

export interface PlayerPreviewBuildArtifacts {
  inputEntries: Record<string, string>;
  generatedOgImagesDir: string;
  generatedPlayersDir: string;
}

export const generatePlayerPreviewBuildArtifacts = (frontendRoot: string): PlayerPreviewBuildArtifacts => {
  const generatedRoot = path.resolve(frontendRoot, GENERATED_ROOT_RELATIVE);
  const leaguePlayerDataPath = path.resolve(frontendRoot, LEAGUE_PLAYER_DATA_RELATIVE);
  const profileImagesSourceDir = path.resolve(frontendRoot, PROFILE_IMAGES_SOURCE_RELATIVE);
  const generatedOgImagesDir = path.resolve(frontendRoot, GENERATED_OG_IMAGES_RELATIVE);

  const playerNames = extractPlayerNames(leaguePlayerDataPath);
  const sourceImageMap = buildSourceImageMap(profileImagesSourceDir);

  fs.rmSync(generatedRoot, { recursive: true, force: true });
  fs.rmSync(generatedOgImagesDir, { recursive: true, force: true });
  fs.mkdirSync(generatedOgImagesDir, { recursive: true });

  const inputEntries: Record<string, string> = {};

  for (const playerName of playerNames) {
    const routeSlug = routeSlugFromName(playerName);
    const imageSlug = imageSlugFromName(playerName);
    const sourceImagePath = sourceImageMap.get(imageSlug) ?? null;
    const imageDataUri = sourceImagePath ? toDataUri(sourceImagePath) : null;

    const ogFileName = `${routeSlug}.svg`;
    const ogImagePath = `/playerProfiles/generated/${ogFileName}`;
    const ogSvgPath = path.join(generatedOgImagesDir, ogFileName);
    fs.writeFileSync(ogSvgPath, createAvatarOgSvg(playerName, imageDataUri), 'utf-8');

    const htmlSourcePath = path.resolve(generatedRoot, routeSlug, 'index.html');
    fs.mkdirSync(path.dirname(htmlSourcePath), { recursive: true });
    fs.writeFileSync(htmlSourcePath, createPlayerPreviewHtml(playerName, ogImagePath), 'utf-8');

    inputEntries[`Spieler/${routeSlug}/index`] = htmlSourcePath;
  }

  return {
    inputEntries,
    generatedOgImagesDir,
    generatedPlayersDir: generatedRoot,
  };
};
