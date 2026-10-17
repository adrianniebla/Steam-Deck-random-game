# Random Game

A [Decky Loader](https://decky.xyz) plugin for the Steam Deck. Open it from the Quick Access Menu, press **Pick a random game**, and it opens a random game's library page. Nothing launches; you decide whether to press Play.

- **Installed games only** toggle (on by default). Turn it off to pick from your whole library.
- **Include non-Steam games** toggle (off by default) adds games you added as shortcuts (emulators, Heroic, Lutris, etc.).
- Avoids repeating your last 5 picks.

## Setup

Requirements: Node.js (current LTS), pnpm 9 (`npm i -g pnpm@9`), and on the Deck: Decky Loader plus SSH (`passwd`, then `sudo systemctl enable --now sshd` in Desktop Mode).

```sh
pnpm i
pnpm run build      # outputs dist/index.js
./deploy.sh         # or ./deploy.sh deck@192.168.1.50
```

`deploy.sh` will ask for the Deck's sudo password, because the plugins folder is owned by root.

## Debugging

Turn on Developer mode in Decky's settings, then in Chrome on your Mac open `chrome://inspect`, add `<deck-ip>:8081` as a target, and inspect **SharedJSContext**. Useful checks:

```js
collectionStore.localGamesCollection.visibleApps.length
collectionStore.allGamesCollection.visibleApps.length
collectionStore.deckDesktopApps?.visibleApps.length   // non-Steam shortcuts
```

These stores are undocumented Steam client internals, so a Steam update can rename them.

## License

BSD-3-Clause (from the decky-plugin-template).
