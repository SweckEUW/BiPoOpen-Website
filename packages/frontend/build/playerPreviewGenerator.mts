import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const MAIN_COLOR = '#EA5160';
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
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

const splitNameForOg = (name: string): [string, string | null] => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const fullName = parts.join(' ');

  if (parts.length === 0) return ['', null];
  if (parts.length === 1) return [fullName, null];
  if (parts.length === 2 && fullName.length >= 16) return [parts[0], parts[1]];
  if (parts.length <= 2) return [name, null];

  const firstLine = parts.slice(0, 2).join(' ');
  const secondLine = parts.slice(2).join(' ');
  return [firstLine, secondLine];
};

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
  const [nameLineOne, nameLineTwo] = splitNameForOg(playerName);
  const safeLineOne = escapeHtml(nameLineOne);
  const safeLineTwo = nameLineTwo ? escapeHtml(nameLineTwo) : null;

  const imageCenterX = 930;
  const imageCenterY = 315;
  const outerRadius = 210;
  const innerRadius = 194;
  const headlineY = 140;
  const nameLineOneY = 255;
  const nameLineTwoY = 338;
  const ctaX = 90;
  const ctaY = 470;
  const ctaWidth = 430;
  const ctaHeight = 96;

  const imageMarkup = imageDataUri
    ? `<circle cx="${imageCenterX}" cy="${imageCenterY}" r="${outerRadius}" fill="#ffffff" />
    <clipPath id="avatarClip">
      <circle cx="${imageCenterX}" cy="${imageCenterY}" r="${innerRadius}" />
    </clipPath>
    <image href="${imageDataUri}" x="${imageCenterX - innerRadius}" y="${imageCenterY - innerRadius}" width="${innerRadius * 2}" height="${innerRadius * 2}" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatarClip)" />`
    : `<circle cx="${imageCenterX}" cy="${imageCenterY}" r="${outerRadius}" fill="#ffffff" />
    <circle cx="${imageCenterX}" cy="${imageCenterY}" r="${innerRadius}" fill="#ffffff" />
    <text x="${imageCenterX}" y="${imageCenterY}" text-anchor="middle" dominant-baseline="central" font-family="Arial, Helvetica, sans-serif" font-size="142" font-weight="700" fill="${MAIN_COLOR}">${initials}</text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" role="img" aria-label="${safePlayerName}">
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${MAIN_COLOR}" />
  <text x="90" y="${headlineY}" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="700" fill="#FFE7EA">Spielerprofil</text>
  <text x="90" y="${nameLineOneY}" font-family="Arial, Helvetica, sans-serif" font-size="84" font-weight="800" fill="#FFFFFF">${safeLineOne}</text>
  ${safeLineTwo ? `<text x="90" y="${nameLineTwoY}" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="700" fill="#FFFFFF">${safeLineTwo}</text>` : ''}
  <rect x="${ctaX}" y="${ctaY}" width="${ctaWidth}" height="${ctaHeight}" rx="48" fill="#FFFFFF" />
  <text x="${ctaX + ctaWidth / 2}" y="${ctaY + 62}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700" fill="${MAIN_COLOR}">Zum Spielerprofil</text>
  ${imageMarkup}
</svg>
`;
};

const renderOgPngFromSvg = async (svg: string, outputPath: string): Promise<void> => {
  await sharp(Buffer.from(svg, 'utf-8'))
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
};

const createPlayerPreviewHtml = (playerName: string, ogImagePath: string): string => {
  const safeName = escapeHtml(playerName);
  const playerSlug = routeSlugFromName(playerName);
  const safeSlug = escapeHtml(playerSlug);
  const title = `Spielerprofil von ${safeName} | Weck BiPo Open Turnierserie`;
  const description = `Entdecke das offizielle Spielerprofil von ${safeName} bei den Weck BiPo Open mit Teamhistorie, Turnierstationen, Bildern und direkten Einblicken in aktuelle Ergebnisse.`;

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
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Spielerprofil von ${safeName} mit Hinweis zum Spielerprofil" />

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

export const generatePlayerPreviewBuildArtifacts = async (frontendRoot: string): Promise<PlayerPreviewBuildArtifacts> => {
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

    const ogFileName = `${routeSlug}.png`;
    const ogImagePath = `/playerProfiles/generated/${ogFileName}`;
    const ogPngPath = path.join(generatedOgImagesDir, ogFileName);
    const ogSvg = createAvatarOgSvg(playerName, imageDataUri);
    await renderOgPngFromSvg(ogSvg, ogPngPath);

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
