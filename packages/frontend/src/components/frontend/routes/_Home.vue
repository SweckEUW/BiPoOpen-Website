
<template>
    <div class="Home">

        <!-- ═══════ HERO SECTION ═══════ -->
        <section class="ho-hero" :class="{ 'ho-hero--skeleton': !heroLoaded }" :style="heroLoaded ? { backgroundImage: `url(${heroImage})` } : {}">
            <!-- Skeleton while image loads -->
            <div v-if="!heroLoaded" class="ho-hero-skeleton">
                <Skeleton width="340px" height="4.5rem" class="ho-hero-skeleton-title" />
                <Skeleton width="260px" height="1.3rem" class="ho-hero-skeleton-subtitle" />
                <div class="ho-hero-skeleton-timer">
                    <div v-for="i in 4" :key="i" class="ho-hero-skeleton-box">
                        <Skeleton width="48px" height="2rem" />
                        <Skeleton width="56px" height="0.75rem" />
                    </div>
                </div>
            </div>

            <!-- Actual content once loaded -->
            <template v-else>
                <div class="ho-hero-overlay"></div>
                <h1 class="ho-title-1">BiPo Open 2026</h1>
                <p class="ho-subtitle">Samstag 11.07.2026 - 14:00 Uhr</p>

                <div v-if="!countdownOver" class="ho-timer">
                    <div v-for="unit in countdown" :key="unit.label" class="ho-time">
                        <div class="ho-time-value">{{ unit.value }}</div>
                        <div class="ho-time-label">{{ unit.label }}</div>
                    </div>
                </div>

                <div v-else class="ho-hero-links">
                    <router-link class="ho-hero-btn" to="/2026/Spielplan">Spielplan</router-link>
                    <router-link class="ho-hero-btn" to="/2026/MVP">MVP</router-link>
                    <router-link class="ho-hero-btn" to="/Regeln">Regeln</router-link>
                </div>
            </template>
        </section>

        <!-- ═══════ DASHBOARD GRID ═══════ -->
        <div class="ho-grid">

            <!-- ─── Recent Games ─── -->
            <section class="ho-card ho-card-wide">
                <div class="ho-card-header">
                    <span class="material-icons ho-card-icon">history</span>
                    <h3>Letzte Spiele</h3>
                </div>
                <div v-if="recentGamesLoading" class="ho-games-skeleton">
                    <div v-for="i in 5" :key="i" class="ho-games-skeleton-row">
                        <div class="flex items-center gap-[8px] mb-[6px]">
                            <Skeleton width="80px" height="22px" borderRadius="12px" />
                            <Skeleton width="140px" height="14px" />
                        </div>
                        <Skeleton width="100%" height="42px" borderRadius="4px" />
                    </div>
                </div>
                <div v-else>
                    <div class="ho-fade-wrapper">
                        <div v-for="item in recentGames" :key="item.match._id" class="ho-open-game">
                            <div class="flex items-center gap-[8px] mb-[6px]">
                                <Tag :value="item.source" severity="secondary" rounded />
                                <span class="text-[12px] text-[--p-text-muted-color]" v-if="item.time">
                                    {{ getGameTime(item.time) }}
                                </span>
                            </div>
                            <MatchElement :match="item.match" />
                        </div>
                        <div class="ho-fade-overlay"></div>
                    </div>
                    <router-link to="/Offene-Spiele" class="ho-cta-btn">Alle Offenen Spiele ansehen</router-link>
                </div>
            </section>

            <!-- ─── League Standings ─── -->
            <section class="ho-card">
                <div class="ho-card-header">
                    <span class="material-icons ho-card-icon">emoji_events</span>
                    <h3>BiPo League Saison 2025/26</h3>
                </div>
                <div v-if="leagueLoading" class="ho-league-skeleton">
                    <div v-for="i in 5" :key="i" class="ho-league-skeleton-row">
                        <Skeleton width="1.5rem" height="1rem" />
                        <Skeleton shape="circle" size="28px" />
                        <Skeleton width="60%" height="1rem" />
                        <Skeleton width="1.5rem" height="1rem" />
                        <Skeleton width="1.5rem" height="1rem" />
                        <Skeleton width="2rem" height="1rem" />
                    </div>
                </div>
                <div v-else>
                    <div class="ho-fade-wrapper">
                        <table class="ho-league-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th class="text-left">Team</th>
                                    <th>S</th>
                                    <th>N</th>
                                    <th>Trfv.</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(player, index) in leagueTop5" :key="player.name"
                                    :class="{ 'ho-league-top3': index < 3 }">
                                    <td>{{ player.placement! + 1 }}</td>
                                    <td class="ho-league-team">
                                        <img class="ho-league-logo" :src="leaguePlayers.find(lp => lp.name === player.name)?.logo" :alt="player.name">
                                        <span>{{ player.name }}</span>
                                    </td>
                                    <td>{{ player.wins }}</td>
                                    <td>{{ player.ammountOfMatches - player.wins }}</td>
                                    <td class="ho-league-diff">{{ player.hitDifference }}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="ho-fade-overlay"></div>
                    </div>
                    <router-link to="/League" class="ho-cta-btn">Komplette Tabelle ansehen</router-link>
                </div>
            </section>

            <!-- ─── Last Tournament ─── -->
            <section class="ho-card ho-card-wide">
                <div class="ho-card-header">
                    <span class="material-icons ho-card-icon">military_tech</span>
                    <h3>Letztes Turnier</h3>
                </div>
                <div v-if="lastTournamentLoading" class="ho-tournament-skeleton">
                    <Skeleton width="200px" height="1.4rem" class="mb-[10px]" />
                    <!-- Podium skeleton -->
                    <div class="ho-tournament-skeleton-podium">
                        <div v-for="i in 3" :key="i" class="ho-tournament-skeleton-podium-entry">
                            <Skeleton shape="circle" size="32px" />
                            <div class="flex flex-col gap-[4px]">
                                <Skeleton width="60px" height="12px" />
                                <Skeleton width="100px" height="14px" />
                                <Skeleton width="130px" height="12px" />
                            </div>
                        </div>
                    </div>
                    <Skeleton width="160px" height="36px" borderRadius="8px" class="mt-[12px]" />
                    <!-- MVP skeleton -->
                    <Skeleton width="50px" height="1rem" class="mt-[20px] mb-[8px]" />
                    <div class="flex flex-col gap-[8px]">
                        <Skeleton v-for="i in 4" :key="i" width="100%" height="28px" />
                    </div>
                    <Skeleton width="160px" height="36px" borderRadius="8px" class="mt-[12px]" />
                </div>
                <div v-else-if="lastTournament">
                    <div class="font-bold text-[var(--main-color)] text-[20px] pb-[10px]">{{ lastTournament.name }}</div>
                    <TournamentOverview
                        :tournament="lastTournament"
                        :photoIds="lastTournamentPhotoIds"
                        :basePath="'/' + BIPO_OPEN_TOURNAMENT_YEARS[BIPO_OPEN_TOURNAMENT_YEARS.length - 1]"
                    />
                </div>
            </section>

        </div>

        <!-- ═══════ FEATURES SECTION ═══════ -->
        <section class="ho-features">
            <div class="ho-features-grid">

                <!-- Player Search -->
                <div class="ho-feature-card">
                    <span class="material-icons ho-feature-icon">search</span>
                    <h4>Spieler Suche</h4>
                    <p>Finde Spieler und sieh dir ihre Statistiken an</p>
                    <AutoComplete
                        v-model="playerSearch"
                        :suggestions="playerSuggestions"
                        @complete="searchPlayers"
                        @item-select="onPlayerSelect"
                        @focus="loadPlayerNames"
                        placeholder="Spieler suchen..."
                        class="ho-player-autocomplete"
                        appendTo="self"
                        :dropdown="false"
                        overlayClass="ho-autocomplete-panel-top"
                    />
                </div>

                <!-- Tournament Archive -->
                <div class="ho-feature-card">
                    <span class="material-icons ho-feature-icon">history</span>
                    <h4>Turnier Archiv</h4>
                    <p>Alle Turniere seit 2020 auf einen Blick</p>
                    <Select
                        :modelValue="selectedTournament"
                        :options="tournamentOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Turnier auswählen..."
                        appendTo="self"
                        class="ho-tournament-select"
                        @update:modelValue="onTournamentSelect"
                    />
                </div>

                <!-- Tournament Rules -->
                <div class="ho-feature-card ho-feature-card-clickable" @click="router.push('/Regeln')">
                    <span class="material-icons ho-feature-icon">menu_book</span>
                    <h4>Turnier Regeln</h4>
                    <p>Alle Regeln für das BiPo Open Turnier</p>
                    <div class="ho-feature-hint">Ansehen →</div>
                </div>

                <!-- Hall of Fame -->
                <div class="ho-feature-card ho-feature-card-clickable" @click="router.push('/Hall-Of-Fame')">
                    <span class="material-icons ho-feature-icon">workspace_premium</span>
                    <h4>Hall of Fame</h4>
                    <p>Die besten Spieler aller Zeiten im Überblick</p>
                    <div class="ho-feature-hint">Ansehen →</div>
                </div>

            </div>
        </section>

    </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, inject } from 'vue';
import { getAllOpenGames } from '@/components/frontend/openGames/OpenGamesUtilFunctions';
import { getAllLeagueGames, getLeagueList } from '@/components/frontend/league/LeagueUtilFunctions';
import { getTournamentByName } from '@/util/tournamentFunctions';
import { BIPO_OPEN_TOURNAMENT_YEARS } from '@/util/bipoOpenTournamentMeta';
import { getAllPlayerNames } from '@/components/frontend/playerProfile/PlayerProfileUtilFunctions';
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';
import TournamentOverview from '@/components/frontend/tournament/_Overview.vue';
import Skeleton from 'primevue/skeleton';
import AutoComplete from 'primevue/autocomplete';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import router from '@/router.js';
import { LEAGUE_PLAYERS } from '../league/LeaguePlayersData';

const openPlayerProfile = inject<(name: string) => void>('openPlayerProfile');

// ─── Countdown ───
const countdownOver = ref(false);
const countdown = ref<{ value: number; label: string }[]>([]);

const updateCountdown = () => {
    const diff = new Date(2026, 6, 11, 14).getTime() - Date.now();
    if (diff <= 0) { countdownOver.value = true; clearInterval(timer); return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    countdown.value = [
        { value: d, label: 'Tage' },
        { value: h, label: 'Stunden' },
        { value: m, label: 'Minuten' },
        { value: s, label: 'Sekunden' },
    ];
};
updateCountdown();
const timer = setInterval(updateCountdown, 1000);
onBeforeUnmount(() => clearInterval(timer));

// ─── Hero Image ───
const heroImage = ref('');
const heroLoaded = ref(false);

const loadHeroImage = async () => {
    const years = ['2023', '2024', '2025'];
    const year = years[Math.floor(Math.random() * years.length)];
    try {
        const url = new URL(`/src/assets/${year}/driveImageIDs.json`, import.meta.url);
        const response = await fetch(url);
        const photos: { img_id: string; name: string }[] = await response.json();
        if (photos.length) {
            const photo = photos[Math.floor(Math.random() * photos.length)];
            const imgUrl = `https://lh3.googleusercontent.com/d/${photo.img_id}=w1200`;
            const img = new Image();
            img.onload = () => {
                heroImage.value = imgUrl;
                heroLoaded.value = true;
            };
            img.onerror = () => {
                heroLoaded.value = true;
            };
            img.src = imgUrl;
            return;
        }
    } catch { /* silent */ }
    heroLoaded.value = true;
};
loadHeroImage();

// ─── League Data ───
let leaguePlayers: LeaguePlayer[] = LEAGUE_PLAYERS;

const leagueTop5 = ref<PlayerWithStats[]>([]);
const leagueLoading = ref(true);

const recentGames = ref<MatchHistoryEntry[]>([]);
const recentGamesLoading = ref(true);

const lastTournament = ref<Tournament | null>(null);
const lastTournamentLoading = ref(true);
const lastTournamentPhotoIds = ref<{img_id: string, name: string}[]>([]);

// ─── Player Search ───
const playerSearch = ref('');
const playerSuggestions = ref<string[]>([]);
let playerNames: string[] = [];
let playerNamesLoaded = false;

const loadPlayerNames = async () => {
    if (playerNamesLoaded) return;
    playerNames = await getAllPlayerNames();
    playerNamesLoaded = true;
};

const searchPlayers = async (event: { query: string }) => {
    const query = event.query.trim().toLowerCase();
    if (!query) { playerSuggestions.value = []; return; }
    if (!playerNamesLoaded) await loadPlayerNames();
    playerSuggestions.value = playerNames.filter(n => n.toLowerCase().includes(query)).slice(0, 10);
};

const onPlayerSelect = (event: { value: string }) => {
    const name = event.value;
    playerSearch.value = '';
    playerSuggestions.value = [];
    if (openPlayerProfile) {
        openPlayerProfile(name);
    } else {
        router.push(`/Spieler/${encodeURIComponent(name).replaceAll('%20', '-')}`);
    }
};

// ─── Tournament Selector ───
const tournaments = ['Weck BiPo Open 2025', 'Weck BiPo Open 2024', 'Weck BiPo Open 2023', 'Weck BiPo Open 2022', 'Weck BiPo Open 2020'];
const tournamentOptions = tournaments.map(t => ({
    label: t,
    value: '/' + t.replaceAll('Weck BiPo Open ', '').replaceAll(' ', '-'),
}));
const selectedTournament = ref<string | null>(null);
const onTournamentSelect = (value: string | null) => {
    if (!value) return;
    router.push(value);
    selectedTournament.value = null;
};

// ─── Load Data ───
const loadLeague = async () => {
    try {
        const games = await getAllLeagueGames();
        const list = getLeagueList(games, leaguePlayers);
        leagueTop5.value = list.slice(0, 5);
    } catch { /* silent */ }
    leagueLoading.value = false;
};

const loadRecentGames = async () => {
    try {
        const [openGames, leagueGames] = await Promise.all([
            getAllOpenGames(),
            getAllLeagueGames(),
        ]);
        const entries: MatchHistoryEntry[] = [
            ...openGames.map(m => ({ match: m, source: 'Offenes Spiel', time: m.time ?? 0 })),
            ...leagueGames.map(m => ({ match: m, source: 'Liga', time: m.time ?? 0 })),
        ];
        entries.sort((a, b) => b.time - a.time);
        recentGames.value = entries.slice(0, 5);
    } catch { /* silent */ }
    recentGamesLoading.value = false;
};

const loadLastTournament = async () => {
    const lastYear = BIPO_OPEN_TOURNAMENT_YEARS[BIPO_OPEN_TOURNAMENT_YEARS.length - 1];
    try {
        const t = await getTournamentByName(lastYear);
        if (t) lastTournament.value = t;
    } catch { /* silent */ }
    lastTournamentLoading.value = false;

    try {
        const photoUrl = new URL(`/src/assets/${lastYear}/driveImageIDs.json`, import.meta.url);
        const response = await fetch(photoUrl);
        lastTournamentPhotoIds.value = await response.json();
    } catch { /* photos not available */ }
};

loadLeague();
loadRecentGames();
loadLastTournament();

// ─── Helpers ───
const getGameTime = (dateNumber: number) => {
    const date = new Date(dateNumber);
    const time = date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    return date.toLocaleDateString('de-DE') + '  -  ' + time + ' Uhr';
};

const getTeamScore = (match: Match, teamKey: 'team1' | 'team2') => {
    return match[teamKey].players.reduce((sum, p) => sum + p.score, 0);
};

</script>

<style scoped>
.Home {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 50px;
    padding-bottom: 30px;
}

/* ═══════ HERO ═══════ */
.ho-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: calc(100% + 40px);
    margin-left: -20px;
    margin-top: -20px;
    padding: 60px 20px;
    text-align: center;
    position: relative;
    background-size: cover;
    background-position: center;
    border-radius: 16px;
    overflow: hidden;
    min-height: 280px;
    transition: background-image 0.5s ease;
    margin-top: 20px;
}
.ho-hero--skeleton {
    background: linear-gradient(135deg, rgba(234, 81, 96, 0.85) 0%, rgba(97, 195, 217, 0.75) 100%);
}
.ho-hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(234, 81, 96, 0.85) 0%, rgba(97, 195, 217, 0.75) 100%);
    z-index: 0;
    /* opacity: 0.8; */
}
.ho-hero > *:not(.ho-hero-overlay) {
    position: relative;
    z-index: 1;
}
.ho-title-1 {
    color: white;
    font-size: 64px;
    margin: 0;
    line-height: 1.1;
    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
}
.ho-subtitle {
    color: rgba(255, 255, 255, 0.9);
    font-size: 18px;
    margin: 8px 0 0 0;
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.15);
}
.ho-timer {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 24px;
}
.ho-time {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    padding: 16px 12px;
    min-width: 80px;
    text-align: center;
}
.ho-time-value {
    font-size: 32px;
    color: white;
    font-weight: bold;
    line-height: 1;
}
.ho-time-label {
    color: rgba(255, 255, 255, 0.85);
    font-size: 12px;
    margin-top: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.ho-hero-links {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 24px;
}
.ho-hero-btn {
    padding: 12px 30px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    color: white;
    text-decoration: none;
    font-size: 16px;
    font-weight: bold;
    border-radius: 8px;
    transition: background 0.2s;
}
.ho-hero-btn:hover {
    background: rgba(255, 255, 255, 0.35);
    color: white;
}

/* ═══════ GRID ═══════ */
.ho-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 25px;
    width: 100%;
}
.ho-card {
    background: white;
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    position: relative;
    min-height: 200px;
}
.ho-card-wide {
    grid-column: 1 / -1;
}
.ho-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--main-color);
}
.ho-card-header h3 {
    margin: 0;
    font-size: 22px;
    color: var(--main-color);
}
.ho-card-icon {
    color: var(--main-color);
    font-size: 26px;
}
.ho-card-link {
    display: block;
    margin-top: 15px;
    text-align: right;
    color: var(--secondary-color);
    text-decoration: none;
    font-weight: bold;
    font-size: 15px;
    transition: color 0.2s;
}
.ho-card-link:hover {
    color: var(--main-color);
}

/* ─── Fade Overlay ─── */
.ho-fade-wrapper {
    position: relative;
    overflow: hidden;
}
.ho-fade-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(transparent, white);
    pointer-events: none;
}
.ho-cta-btn {
    display: block;
    text-align: center;
    margin-top: 16px;
    padding: 10px 24px;
    background: var(--main-color);
    color: white;
    text-decoration: none;
    font-weight: bold;
    font-size: 14px;
    border-radius: 8px;
    transition: background 0.2s;
}
.ho-cta-btn:hover {
    background: #d4434f;
    color: white;
}

/* ─── League Table ─── */
.ho-league-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 15px;
}
.ho-league-table th {
    padding: 8px 6px;
    font-size: 13px;
    color: #888;
    border-bottom: 1px solid #eee;
    text-align: center;
}
.ho-league-table th.text-left{
    text-align: left;
}
.ho-league-table td {
    padding: 10px 6px;
    text-align: center;
    border-bottom: 1px solid #f5f5f5;
}
.ho-league-top3 {
    background: rgba(97, 195, 217, 0.08);
}
.ho-league-team {
    display: flex;
    align-items: center;
    gap: 8px;
    text-align: left;
}
.ho-league-logo {
    width: 28px;
    height: 28px;
    object-fit: contain;
    border-radius: 4px;
}
.ho-league-diff {
    font-size: 13px;
    white-space: nowrap;
}

/* ─── Tournament ─── */
.ho-tournament-links {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 15px;
}
.ho-small-btn {
    padding: 8px 18px;
    background: var(--main-color);
    color: white;
    text-decoration: none;
    font-size: 14px;
    border-radius: 6px;
    transition: background 0.3s;
}
.ho-small-btn:hover {
    background: var(--main-color-hover);
    color: white;
}
.ho-small-btn-secondary {
    background: var(--secondary-color);
}
.ho-small-btn-secondary:hover {
    background: #4db3c9;
}

/* ─── Open Games ─── */
.ho-open-game {
    margin-bottom: 12px;
}
.ho-open-game-time {
    font-size: 14px;
    color: var(--main-color);
    margin-bottom: 4px;
}

/* ═══════ FEATURES ═══════ */
.ho-features {
    width: 100%;
}
.ho-section-title {
    color: var(--main-color);
    font-size: 32px;
    text-align: center;
    margin-bottom: 30px;
}
.ho-features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}
.ho-feature-card {
    background: white;
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 8px;
    transition: transform 0.2s, box-shadow 0.2s;
}
.ho-feature-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}
.ho-feature-card-clickable {
    cursor: pointer;
}
.ho-feature-icon {
    font-size: 40px;
    color: var(--main-color);
}
.ho-feature-card h4 {
    margin: 0;
    font-size: 18px;
    color: var(--main-color);
}
.ho-feature-card p {
    margin: 0;
    font-size: 14px;
    color: #666;
    line-height: 1.4;
}
.ho-feature-hint {
    margin-top: auto;
    padding-top: 8px;
    color: var(--main-color);
    font-weight: bold;
    font-size: 14px;
}
.ho-player-autocomplete {
    width: 100%;
    margin-top: 5px;
}
.ho-player-autocomplete :deep(input) {
    width: 100%;
}
.ho-autocomplete-panel-top {
    transform: translateY(-100%) !important;
    top: 0 !important;
    margin-top: -4px;
}

/* ─── League Skeleton ─── */
.ho-league-skeleton {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.ho-league-skeleton-row {
    display: flex;
    align-items: center;
    gap: 10px;
}
.ho-tournament-select {
    width: 100%;
    margin-top: 5px;
}

/* ─── Recent Games Skeleton ─── */
.ho-games-skeleton {
    display: flex;
    flex-direction: column;
    gap: 14px;
}
.ho-games-skeleton-row {
    padding-bottom: 12px;
    border-bottom: 1px solid #f5f5f5;
}
.ho-games-skeleton-row:last-child {
    border-bottom: none;
}

/* ─── Tournament Skeleton ─── */
.ho-tournament-skeleton-podium {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.ho-tournament-skeleton-podium-entry {
    display: flex;
    align-items: center;
    gap: 12px;
}

/* ─── Hero Skeleton ─── */
.ho-hero-skeleton {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    z-index: 1;
    position: relative;
}
.ho-hero-skeleton-title {
    max-width: 400px;
}
.ho-hero-skeleton-subtitle {
    max-width: 300px;
    margin-top: 0;
}
.ho-hero-skeleton-timer {
    display: flex;
    gap: 12px;
    margin-top: 14px;
}
.ho-hero-skeleton-box {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    padding: 16px 12px;
    min-width: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}

/* ═══════ MOBILE ═══════ */
@media (width <= 900px) {
    .Home {
        gap: 30px;
    }
    .ho-hero {
        padding: 40px 15px;
        min-height: 220px;
        width: calc(100% + 30px);
        margin-left: -15px;
    }
    .ho-title-1 {
        font-size: 42px;
    }
    .ho-subtitle {
        font-size: 15px;
    }
    .ho-time {
        min-width: 64px;
        padding: 12px 8px;
    }
    .ho-time-value {
        font-size: 24px;
    }
    .ho-time-label {
        font-size: 10px;
    }
    .ho-grid {
        grid-template-columns: 1fr;
        gap: 18px;
    }
    .ho-card {
        padding: 18px;
    }
    .ho-card-header h3 {
        font-size: 18px;
    }
    .ho-features-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }
    .ho-section-title {
        font-size: 26px;
    }
    .ho-feature-card {
        padding: 20px;
    }
    .ho-hero-btn {
        padding: 12px 25px;
        font-size: 16px;
    }
}

/* ═══════ MOBILE S ═══════ */
@media (width <= 360px) {
    .ho-title-1 {
        font-size: 36px;
    }
    .ho-title-2 {
        font-size: 18px;
    }
}
</style>
