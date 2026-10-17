import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  Navigation,
  ToggleField,
  staticClasses
} from "@decky/ui";
import { definePlugin, toaster } from "@decky/api";
import { useState } from "react";
import { FaDice } from "react-icons/fa";

// Steam client globals that @decky/ui doesn't type. These come from Valve's
// minified client and can be renamed by a Steam update.
interface SteamApp {
  appid: number;
  display_name: string;
  app_type: number;
}
interface SteamCollection {
  visibleApps: SteamApp[];
}
declare global {
  interface Window {
    collectionStore: {
      allGamesCollection: SteamCollection;
      localGamesCollection: SteamCollection;
      // The "Non-Steam" library tab; null when there are no shortcuts.
      deckDesktopApps: SteamCollection | null;
    };
  }
}

const INSTALLED_ONLY_KEY = "random-game:installed-only";
const INCLUDE_NON_STEAM_KEY = "random-game:include-non-steam";
// app_type of non-Steam shortcuts added through "Add a Non-Steam Game".
const APP_TYPE_SHORTCUT = 1073741824;
const RECENT_KEY = "random-game:recent";
const RECENT_LIMIT = 5;

function loadBool(key: string, fallback: boolean): boolean {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === "true";
  } catch {
    return fallback;
  }
}

function loadRecent(): number[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function collectApps(installedOnly: boolean, includeNonSteam: boolean): SteamApp[] {
  const store = window.collectionStore;
  const collection = installedOnly ? store?.localGamesCollection : store?.allGamesCollection;
  const apps = (collection?.visibleApps ?? []).filter(
    (app) => app.appid && app.app_type !== APP_TYPE_SHORTCUT
  );
  if (includeNonSteam) {
    // Shortcuts live on the Deck itself, so they count as installed either way.
    const seen = new Set(apps.map((app) => app.appid));
    for (const app of store?.deckDesktopApps?.visibleApps ?? []) {
      if (app.appid && !seen.has(app.appid)) apps.push(app);
    }
  }
  return apps;
}

function pickRandomApp(installedOnly: boolean, includeNonSteam: boolean) {
  const apps = collectApps(installedOnly, includeNonSteam);
  if (!apps.length) return null;

  // Avoid repeating the last few picks when there are enough games to choose from.
  const recent = loadRecent();
  const fresh = apps.filter((app) => !recent.includes(app.appid));
  const pool = fresh.length ? fresh : apps;
  const app = pool[Math.floor(Math.random() * pool.length)];

  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify([app.appid, ...recent].slice(0, RECENT_LIMIT)));
  } catch {}
  return app;
}

function Content() {
  const [installedOnly, setInstalledOnly] = useState(() => loadBool(INSTALLED_ONLY_KEY, true));
  const [includeNonSteam, setIncludeNonSteam] = useState(() => loadBool(INCLUDE_NON_STEAM_KEY, false));

  const saveToggle = (key: string, set: (value: boolean) => void) => (value: boolean) => {
    set(value);
    try {
      localStorage.setItem(key, String(value));
    } catch {}
  };

  const onPick = () => {
    const app = pickRandomApp(installedOnly, includeNonSteam);
    if (!app) {
      toaster.toast({ title: "Random Game", body: "No games found in your library" });
      return;
    }
    // Opens the game's library page; the user decides whether to press Play.
    Navigation.Navigate(`/library/app/${app.appid}`);
    Navigation.CloseSideMenus();
  };

  return (
    <PanelSection>
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={onPick}>
          Pick a random game
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <ToggleField
          label="Installed games only"
          description="Off picks from your whole library"
          checked={installedOnly}
          onChange={saveToggle(INSTALLED_ONLY_KEY, setInstalledOnly)}
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <ToggleField
          label="Include non-Steam games"
          description="Also pick from games you added as shortcuts"
          checked={includeNonSteam}
          onChange={saveToggle(INCLUDE_NON_STEAM_KEY, setIncludeNonSteam)}
        />
      </PanelSectionRow>
    </PanelSection>
  );
}

export default definePlugin(() => ({
  name: "Random Game",
  titleView: <div className={staticClasses.Title}>Random Game</div>,
  content: <Content />,
  icon: <FaDice />,
}));
