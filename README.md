# ESTERIA Interactive Demo

Landscape-only interactive real-estate demo. Production files live in `public/assets/` and `src/data/esteriaInteractionMap.json`. Files under `design-reference/` are visual references only and are not used at runtime.

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

Place looping background music at `public/assets/audio/ambient.mp3` if you want audio after **Start Experience**.

---

# Esteria Asset Package

This package is organized so Cursor can distinguish **production assets** from **design references** without guessing.

## Use in production
- `public/assets/**` contains the files the application should actually render.
- `src/data/esteriaInteractionMap.json` contains exact SVG path geometry and walkthrough hotspot positions extracted from the supplied reference screens.

## Reference only
- `design-reference/**` contains lightweight rendered previews of the original Figma mockups.
- These files are intentionally **outside `public/`**. Cursor should inspect them for layout, hover states, pointer placement, typography and visual treatment, but must never import/render them in the production UI.

## Important implementation notes
1. The masterplan and building backgrounds in `public/assets` were rendered from the same 1920x1080 reference coordinate system used by the interaction paths, so overlays stay aligned.
2. Use `src/data/esteriaInteractionMap.json` to render interactive inline SVG paths. Do not make the entire external SVG image clickable.
3. Walkthrough WebPs are the clean usable scenes. The rendered images in `design-reference/walkthrough/` are placement references only.
4. The supplied walkthrough WebPs are wide rendered scenes, not standard 2:1 equirectangular panoramas. Do not force them onto an equirectangular sphere. Use the supplied room scene as the visual and layer hotspots at the normalized positions in the JSON.
5. The application is landscape-only. If `height > width`, block the experience with a rotate-device screen.
6. Put the user's music file at `public/assets/audio/ambient.mp3`.


## Cursor-ready edition
The reference folder uses lightweight WebP previews rather than the original giant SVG exports. This prevents Cursor from indexing huge embedded base64 image data. Exact geometry is already provided in `src/data/esteriaInteractionMap.json`.
