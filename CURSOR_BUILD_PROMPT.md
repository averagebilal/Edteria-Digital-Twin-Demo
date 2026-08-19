# Cursor One-Shot Build Prompt: ESTERIA Interactive Real Estate Demo

Build the complete ESTERIA interactive real-estate demo in this repository in one pass. Do not stop to ask questions unless the repository is genuinely impossible to run. Use reasonable assumptions, finish the full experience, test it, fix errors, and leave the project deployment-ready.

## 0. Read this first: asset rules

The repository contains two completely different categories of files:

### PRODUCTION FILES: actually use these in the app
- `public/assets/**`
- `src/data/esteriaInteractionMap.json`

### DESIGN REFERENCE FILES: look at these only to match the intended UI
- `design-reference/**`

Never render or import anything from `design-reference/**` in production. Those images are visual references showing the intended composition, hover state, popup design, and walkthrough pointer placement.

Do not waste time reverse-engineering coordinates from the references. Exact clickable geometry and hotspot positions have already been extracted into `src/data/esteriaInteractionMap.json`.

## 1. Stack and approach

If the repo already has a working React/Vite/TypeScript setup, keep it. Otherwise use:
- React
- TypeScript
- Vite
- Three.js only where useful
- plain CSS or the project's existing styling solution

Do not add a backend, database, auth, CMS, analytics, React Three Fiber, or a heavy UI library.

This is a polished 2.5D sales demo. Do not invent 3D building geometry. The building/masterplan experience is image + inline SVG interaction geometry.

The supplied walkthrough room WebPs are wide rendered room scenes, not standard 2:1 equirectangular textures. Therefore DO NOT stretch them onto a Three.js sphere. Use the clean WebP room renders as the actual walkthrough scenes and layer interactive room hotspots on top. Match the pointer placement references.

## 2. Landscape only, mandatory

The entire experience must work ONLY in landscape orientation on mobile, tablet, and desktop.

If `window.innerHeight > window.innerWidth` or CSS reports portrait orientation:
- completely block the experience
- show a dark full-screen orientation screen
- show the ESTERIA logo
- show text: `Rotate your device to continue`
- do not allow clicks through the overlay
- pause or mute background audio while portrait is active

When the device returns to landscape, restore the exact state the user was on. Do not restart the experience.

Use `100dvh` where appropriate and handle orientation/resize changes cleanly.

## 3. Critical alignment rule

Masterplan and building interaction geometry uses a logical coordinate system of `1920 x 1080`.

Do NOT independently scale the image and overlays.

Create one reusable `Stage` component that:
- has a logical 16:9 canvas
- scales uniformly to fit inside the available landscape viewport
- remains centered
- may letterbox on non-16:9 screens
- contains both the base image and inline SVG overlay

Correct alignment is more important than filling every pixel.

The base image and SVG interaction layer must share exactly the same rendered rectangle.

For masterplan/building SVG paths, render inline SVG with:
`viewBox="0 0 1920 1080"`

Get all path `d` values from:
`src/data/esteriaInteractionMap.json`

Do not manually redraw hitboxes.

## 4. Production assets

Use these exact files:

### Branding
`/assets/branding/esteria-logo.svg`

### Masterplan
`/assets/masterplan/masterplan.webp`

### Building
`/assets/building/building-front.webp`

### Walkthrough scenes
`/assets/walkthrough/lounge.webp`
`/assets/walkthrough/balcony.webp`
`/assets/walkthrough/kitchen.webp`
`/assets/walkthrough/master-bedroom.webp`
`/assets/walkthrough/bathroom.webp`

### Music
Expected path:
`/assets/audio/ambient.mp3`

The music file may not exist yet. Handle that gracefully. Once present, it should start after the user presses Start Experience, loop continuously, and not restart during screen changes.

### Interaction data
`src/data/esteriaInteractionMap.json`

This file is the source of truth for:
- masterplan building highlight path
- all 5 floor paths
- all apartment paths per floor
- walkthrough hotspot positions
- default and hover opacity values
- highlight color

## 5. Design references

Use the files under `design-reference/` only to visually match the design.

Important reference groups:
- `design-reference/opening/` = opening screen, clean masterplan, building-hover state
- `design-reference/building/floor-selection/` = how each floor highlight should look
- `design-reference/building/apartment-selection/` = apartment-region layout per floor
- `design-reference/ui/` = apartment modal and building hover popup
- `design-reference/walkthrough/` = room scene pointer placement and appearance

Do not import these files into the running application.

## 6. State model

Use a simple state-driven app. No router is necessary.

Suggested state:
- screen: `opening | masterplan | building | walkthrough`
- hoveredFloor
- selectedFloor
- hoveredApartment
- selectedApartment
- apartmentModalOpen
- currentRoom
- audioEnabled

Preserve selected floor/apartment when exiting the walkthrough.

## 7. Opening screen

Match `design-reference/opening/01-start-screen`.

Full viewport darkened masterplan background.
Centered ESTERIA logo.
Centered `Start Experience` button beneath it.

On click:
1. start/attempt background music because the user gesture allows audio
2. fade smoothly into the masterplan screen

Transition around 300-500ms. Keep it premium and restrained.

## 8. Masterplan

Match the clean masterplan reference.

Show:
- masterplan background
- ESTERIA logo top-left
- no building highlight by default

Use `interactionMap.masterplan.building.path` as the actual building hit area.

Building state:
- default opacity: 0
- hover opacity: 0.74
- pale gold `#F6EA8C`
- smooth 200-300ms transition
- pointer cursor

On building hover:
- show highlight
- show the small ESTERIA building callout matching the building-hover reference

On click:
- transition to building perspective

## 9. Building perspective and floor selection

Use `/assets/building/building-front.webp`.

Render all five floor paths from `interactionMap.floors` in the same inline 1920x1080 SVG.

Each floor:
- default opacity: 0.24
- hover opacity: 0.74
- selected opacity: 0.74
- pale gold fill/stroke matching the references
- smooth transition
- path-specific pointer interaction only

When a floor is hovered, only that floor changes opacity.
When hover ends, it returns to 0.24 unless selected.

On floor click:
- set `selectedFloor`
- keep that floor at 0.74
- show the apartment paths for that floor using `interactionMap.apartments[selectedFloor]`

## 10. Apartment selection

Each floor has apartment-region paths already supplied in the interaction JSON.

Apartment regions:
- default: 0.24
- hover: 0.74
- selected: 0.74
- pointer cursor

Do not use rectangular hitboxes. Use the supplied architectural paths.

On apartment click:
- set selected apartment
- keep it highlighted
- open the apartment information modal

For this demo, if no unique apartment dataset exists, all clickable units may open the same reference apartment information. Do not invent dozens of fake apartment records.

Use the reference modal content:
- `Penthouse`
- `1850 m²`
- `Apartments Area`
- `2` Floors
- `4` Rooms
- `7` Location
- CTA: `Apartment Walkthrough`

Match `design-reference/ui/apartment-selected-modal-reference` closely with HTML/CSS. Do not render the SVG itself.

Modal requirements:
- floating translucent/dark grey card
- rounded corners
- subtle border
- close icon
- large area value
- three statistic blocks
- pale-yellow CTA
- responsive in landscape mobile/tablet
- never overflow the viewport

CTA enters the walkthrough in the Lounge.

## 11. Walkthrough

The walkthrough is room-to-room visual exploration using the CLEAN WebP files in `public/assets/walkthrough/`.

Do not use the SVG-with-pointers files as the visible room scene.
Do not create an equirectangular sphere from these images.

Show the current room image fullscreen inside a uniformly scaled scene stage. Preserve the source scene's aspect ratio so hotspot placement stays correct.

Use the normalized `xPercent` / `yPercent` values from:
`interactionMap.walkthrough[room].points`

Place pointer UI at those percentages relative to the rendered scene rectangle, not the entire browser viewport.

Room mapping:
- `lounge` -> Lounge
- `balcony` -> Balcony
- `kitchen` -> Kitchen
- `master` -> Master
- `bathroom` -> Bathroom

Pointer visuals should match the references:
- circular thumbnail using the destination room image
- white room label
- premium minimal styling
- scale slightly on hover
- click/tap target large enough for mobile landscape

Navigation defined by the JSON should be respected exactly.

On hotspot click:
- preload destination image if needed
- crossfade to destination room in roughly 250-400ms
- update pointer set
- no page refresh

## 12. Exit walkthrough

Always show a compact `Exit Walkthrough` control in the walkthrough.

On click:
- return to building perspective
- restore selected floor
- restore selected apartment
- restore the apartment modal open, unless closing it results in a cleaner flow

Do not reset the experience.

## 13. Background audio

After Start Experience:
- play `/assets/audio/ambient.mp3` if it exists
- loop it
- default volume about 0.2-0.25
- keep the same audio element alive throughout the app
- add a small sound on/off button
- do not restart track when screens change
- gracefully handle missing audio or browser play rejection

## 14. Responsive behavior

Landscape targets include:
- 1920x1080 desktop
- 1440x900 desktop
- 1366x768 desktop
- landscape tablets
- landscape phones

Because the experience is visual, use a scaled stage rather than reflowing the architecture.

Controls/modal may adapt, but architectural image/overlay alignment must never change.

Use sensible minimum touch target sizes.

## 15. Visual language

Match the supplied references rather than redesigning:
- dark premium presentation
- white/off-white typography
- pale muted yellow highlights
- subtle glassy grey UI
- soft rounded corners
- restrained transitions
- no neon
- no loud gradients
- no generic SaaS dashboard look

## 16. Suggested components

Keep implementation compact. Something like:
- `App`
- `LandscapeGuard`
- `Stage`
- `OpeningScreen`
- `MasterplanScreen`
- `BuildingScreen`
- `ApartmentModal`
- `WalkthroughScreen`
- `AudioControl`

Do not create unnecessary abstraction layers.

## 17. Performance

- preload masterplan/building intelligently
- begin preloading walkthrough WebPs once the user reaches the building screen
- avoid loading design-reference files
- no duplicate listeners
- no duplicate animation loops
- use image decoding/loading states to avoid flashes
- keep previous room visible until destination is ready

## 18. Complete-flow test

Before finishing, run the app and verify this exact journey:

1. launch in landscape
2. opening screen appears
3. Start Experience works
4. masterplan appears
5. hover building -> highlight + callout
6. click building
7. building perspective appears
8. floors show at 24%
9. hover floor -> 74%
10. leave unselected floor -> 24%
11. click floor -> stays 74%
12. apartment regions for that floor appear
13. hover apartment -> 74%
14. click apartment -> stays selected + modal opens
15. click Apartment Walkthrough
16. Lounge loads
17. room pointers appear in the correct locations
18. click pointers and navigate between available rooms
19. audio mute/unmute works
20. Exit Walkthrough returns to prior building/apartment state
21. rotate viewport/device to portrait -> experience is fully blocked with rotate-device UI
22. rotate back -> same state is restored

## 19. Final validation

Fix all errors before stopping.

Run the project's relevant checks and at minimum:
`npm run build`

Production build must succeed.

Check for:
- TypeScript errors
- console errors
- broken asset paths
- incorrect SVG alignment
- hover flicker
- click-through bugs
- modal overflow
- portrait-mode leaks
- touch issues
- audio restarting
- image flash during room changes

Do not add features outside this scope.
Do not stop after scaffolding. Complete the implementation end-to-end and leave it ready to deploy.
