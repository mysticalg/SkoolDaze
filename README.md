# Bellbound Academy

Bellbound Academy is an original school-life sim with a full bell-driven day, social AI, classroom antics, and mobile-friendly controls.

The repo still lives in the older `SkoolDaze` folder for continuity, but the player-facing app branding has been moved toward an original commercial release.

## What's included now

- Expanded school map with upper/lower rooms, playground, and stair landmarks.
- Bell-driven full-day timetable with room targets and lesson transitions.
- Rich cast of pupils + teachers with personality-based AI behaviours.
- Blackboard tasks, teacher discipline, and in-class quiz interaction.
- Mischief systems: punching, catapult projectiles, knockouts, tattling, and lines.
- Shield-letter mission progression with high shield access via knocked-out pupils.
- HUD with time/period/target room/energy/discipline status.
- Event feed and objective checklist for intuitive guidance.
- Touch controls, fullscreen toggle, installable app shell, and offline caching groundwork for Android.

## Run

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Controls

- Move: Arrow Keys / WASD or touch pad
- Punch: `Z` or `Hit`
- Catapult: `X` or `Prank`
- Interact: `E` or `Use`
- Sit / stand: `Q` or `Sit`
- Pause: `P` or `Pause`
- Fullscreen: `F`

## Android / Play Prep

The repo now includes:

- `manifest.webmanifest` and `sw.js` for installable/offline app behavior
- `app-shell.js` for service worker registration and install prompt wiring
- `scripts/build-web.mjs` to stage a clean `dist/` folder for native packaging
- `capacitor.config.ts` and npm scripts for a Capacitor Android wrapper

Typical flow:

```bash
npm install
npm run build:web
npx cap add android
npx cap sync android
npx cap open android
```

Before a real store release, update the package id in `capacitor.config.ts`, replace the placeholder app icons in `app-icons/`, and complete Play Console listing/privacy/billing details.

## GitHub Pages auto-deploy

A GitHub Actions workflow is included at `.github/workflows/deploy-pages.yml` to publish the game automatically to GitHub Pages on every push to `main` or `master` (and via manual dispatch).

To enable it in your repo settings:

1. Go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually) and your game will be published.
