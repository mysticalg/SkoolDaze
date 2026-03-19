# Skool Daze Tribute (HTML5)

🎮 **Play now:** https://mysticalg.github.io/SkoolDaze/

This project is an **original fan tribute** inspired by classic ZX Spectrum school-day gameplay.
It does **not** include or reuse original ROM code/assets.

## What's included now

- Expanded school map with upper/lower rooms, playground, and stair landmarks.
- Bell-driven full-day timetable with room targets and lesson transitions.
- Rich cast of pupils + teachers with personality-based AI behaviours.
- Blackboard tasks, teacher discipline, and in-class quiz interaction.
- Mischief systems: punching, catapult projectiles, knockouts, tattling, and lines.
- Shield-letter mission progression with high shield access via knocked-out pupils.
- HUD with time/period/target room/energy/discipline status.
- Event feed and objective checklist for intuitive guidance.

## Run

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Controls

- Move: Arrow Keys / WASD
- Punch: `Z`
- Catapult: `X`
- Interact: `E`
- Pause: `P`

## Research references used for gameplay direction

- Skool Daze overview and mission loop: https://en.wikipedia.org/wiki/Skool_Daze
- Gameplay and release details: https://www.mobygames.com/game/26331/skool-daze/
- Spectrum archive summary: https://spectrumcomputing.co.uk/entry/4678/ZX-Spectrum/Skool_Daze

## GitHub Pages auto-deploy

A GitHub Actions workflow is included at `.github/workflows/deploy-pages.yml` to publish the game automatically to GitHub Pages on every push to `main` or `master` (and via manual dispatch).

To enable it in your repo settings:

1. Go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually) and your game will be published.

## Support

If you'd like to support this project, you can buy me a coffee:
[buymeacoffee.com/dhooksterm](https://buymeacoffee.com/dhooksterm)
